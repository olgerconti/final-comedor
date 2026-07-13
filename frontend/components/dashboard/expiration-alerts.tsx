'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, Package, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchDashboard } from '@/lib/api'
import type { AlertaLote } from '@/types'

function daysLabel(days: number) {
  if (days <= 0) return 'Caduca hoy'
  if (days === 1) return 'Caduca en 1 día'
  return `Caduca en ${days} días`
}

function ItemRow({ item }: { item: AlertaLote }) {
  const urgent = item.diasRestantes < 3
  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition-colors',
        urgent
          ? 'border-destructive/40 bg-destructive/10'
          : 'border-border bg-card',
      )}
    >
      <div
        className={cn(
          'flex size-14 shrink-0 items-center justify-center rounded-xl',
          urgent ? 'bg-destructive/15 text-destructive' : 'bg-accent text-accent-foreground',
        )}
      >
        <Package className="size-7" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold text-foreground">{item.nombreInsumo}</p>
        <p className="text-base font-medium text-muted-foreground">
          {item.cantidadActual} - {item.nivelAlerta}
        </p>
      </div>

      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold',
          urgent
            ? 'bg-destructive text-primary-foreground'
            : 'bg-chart-3/20 text-chart-3',
        )}
      >
        {urgent ? (
          <AlertTriangle className="size-5" aria-hidden="true" />
        ) : (
          <Clock className="size-5" aria-hidden="true" />
        )}
        {daysLabel(item.diasRestantes)}
      </span>
    </li>
  )
}

export function ExpirationAlerts() {
  const [items, setItems] = useState<AlertaLote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetchDashboard()
        if (!cancelled) setItems(res.alertas)
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const urgentCount = items.filter((i) => i.diasRestantes < 3).length

  return (
    <section
      aria-labelledby="alertas-titulo"
      className="rounded-3xl border border-border bg-card/60 p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="alertas-titulo"
            className="font-heading text-2xl font-bold text-foreground"
          >
            Alertas de Inventario
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Insumos con alertas de caducidad o stock bajo.
          </p>
        </div>
        {urgentCount > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-base font-bold text-primary-foreground">
            <AlertTriangle className="size-5" aria-hidden="true" />
            {urgentCount} urgentes
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="py-8 text-center text-lg text-muted-foreground">
          No hay alertas activas en este momento.
        </p>
      )}

      {!loading && items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <ItemRow key={item.idLote} item={item} />
          ))}
        </ul>
      )}
    </section>
  )
}