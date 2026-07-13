'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fetchReporteRotacion } from '@/lib/api'
import type { ReporteRotacionResponse } from '@/types'

type RotationItem = {
  product: string
  category: string
  consumed: number
}

type RotationTableProps = {
  mes: string
}

function VolumeBar({ value, maxConsumed, total }: { value: number; maxConsumed: number; total: number }) {
  const widthPct = maxConsumed > 0 ? Math.round((value / maxConsumed) * 100) : 0
  const sharePct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-3 w-full max-w-[220px] overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxConsumed}
        aria-label={`Volumen consumido: ${sharePct}% del total`}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-sm font-bold text-muted-foreground">
        {sharePct}%
      </span>
    </div>
  )
}

export function RotationTable({ mes }: RotationTableProps) {
  const [data, setData] = useState<ReporteRotacionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetchReporteRotacion(mes)
        if (!cancelled) setData(res)
      } catch {
        if (!cancelled) setError('No se pudieron cargar los datos de rotación.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [mes])

  const items: RotationItem[] = data
    ? data.productos.map((p) => ({
        product: p.nombreInsumo,
        category: 'General',
        consumed: p.cantidadTotalSalida,
      }))
    : []

  const total = items.reduce((sum, item) => sum + item.consumed, 0)
  const maxConsumed = items.length > 0 ? Math.max(...items.map((item) => item.consumed)) : 0

  return (
    <section
      aria-labelledby="rotacion-titulo"
      className="rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border px-6 py-5">
        <h2
          id="rotacion-titulo"
          className="font-heading text-2xl font-extrabold text-card-foreground"
        >
          Insumos con Mayor Rotación
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Volumen consumido durante el periodo comparado con el total.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <p className="px-6 py-8 text-center text-lg text-muted-foreground">{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="px-6 py-8 text-center text-lg text-muted-foreground">
          No hay datos de rotación para este periodo.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-base font-bold text-muted-foreground">
                  <th scope="col" className="px-6 py-4">Insumo</th>
                  <th scope="col" className="px-6 py-4">Salidas</th>
                  <th scope="col" className="px-6 py-4 text-right">Total Consumido</th>
                  <th scope="col" className="px-6 py-4">Volumen</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.product}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 text-lg font-bold text-card-foreground">
                      {item.product}
                    </td>
                    <td className="px-6 py-4 text-base text-muted-foreground">
                      {data?.productos.find((p) => p.nombreInsumo === item.product)?.vecesSalida ?? data?.productos.find((p) => p.nombreInsumo === item.product)?.salidasMes ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold tabular-nums text-card-foreground">
                      {item.consumed.toFixed(2)}
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">
                        Kg
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <VolumeBar value={item.consumed} maxConsumed={maxConsumed} total={total} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {items.map((item) => (
              <li key={item.product} className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-card-foreground">
                    {item.product}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-semibold text-muted-foreground">
                    Total Consumido
                  </span>
                  <span className="text-lg font-bold tabular-nums text-card-foreground">
                    {item.consumed.toFixed(2)} Kg
                  </span>
                </div>
                <VolumeBar value={item.consumed} maxConsumed={maxConsumed} total={total} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}