'use client'

import { useEffect, useState } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import type { MovimientoResponse } from '@/types'
import { fetchMovimientos, extractErrorMessage, getTodayLocal } from '@/lib/api'

function formatTimestamp(isoString: string) {
  try {
    const date = new Date(isoString)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return '—'
  }
}

export function CheckoutsTable() {
  const [rows, setRows] = useState<MovimientoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const today = getTodayLocal()
        const movs = await fetchMovimientos({
          tipo: 'SALIDA',
          fechaInicio: `${today}T00:00:00`,
          fechaFin: `${today}T23:59:59`,
        })
        if (!cancelled) setRows(movs)
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section aria-labelledby="salidas-hoy-titulo">
      <h2
        id="salidas-hoy-titulo"
        className="mb-4 font-heading text-2xl font-bold text-foreground"
      >
        Salidas registradas hoy
      </h2>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="hidden w-full border-collapse text-left sm:table">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-6 py-4 text-base font-bold text-foreground">Insumo</th>
                <th className="px-6 py-4 text-base font-bold text-foreground">Cantidad</th>
                <th className="px-6 py-4 text-base font-bold text-foreground">Hora</th>
                <th className="px-6 py-4 text-base font-bold text-foreground">Categoría</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.idMovimiento}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-6 py-4 text-lg font-semibold text-card-foreground">
                    {row.nombreInsumo}
                  </td>
                  <td className="px-6 py-4 text-lg text-card-foreground">
                    {row.cantidadMovida}
                  </td>
                  <td className="px-6 py-4 text-lg text-muted-foreground">
                    {formatTimestamp(row.fechaRegistro)}
                  </td>
                  <td className="px-6 py-4 text-lg text-muted-foreground">
                    {row.categoria}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-border sm:hidden">
            {rows.map((row) => (
              <li key={row.idMovimiento} className="flex flex-col gap-1 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-card-foreground">
                    {row.nombreInsumo}
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {row.cantidadMovida}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <Clock className="size-4" aria-hidden="true" />
                  <span>{formatTimestamp(row.fechaRegistro)}</span>
                  <span aria-hidden="true">•</span>
                  <span>{row.categoria}</span>
                </div>
              </li>
            ))}
          </ul>

          {rows.length === 0 && (
            <p className="px-6 py-10 text-center text-lg text-muted-foreground">
              Aún no hay salidas registradas hoy.
            </p>
          )}
        </div>
      )}
    </section>
  )
}