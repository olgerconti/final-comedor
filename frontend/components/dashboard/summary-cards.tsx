'use client'

import { useEffect, useState } from 'react'
import { Utensils, Boxes, Users, TrendingDown, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { fetchDashboard } from '@/lib/api'
import type { DashboardResponse } from '@/types'

type Metric = {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  iconClass: string
}

const EMPTY_METRICS: Metric[] = [
  { label: 'Total Raciones Hoy', value: '—', icon: Utensils, iconClass: 'bg-primary/15 text-primary' },
  { label: 'Total Insumos', value: '—', icon: Boxes, iconClass: 'bg-secondary/15 text-secondary' },
  { label: 'Beneficiarios Atendidos', value: '—', icon: Users, iconClass: 'bg-chart-3/20 text-chart-3' },
  { label: 'Merma Promedio Semanal', value: '—', icon: TrendingDown, iconClass: 'bg-amber-100 text-amber-700' },
]

export function SummaryCards() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetchDashboard()
        if (!cancelled) setData(res)
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const metrics: Metric[] = data
    ? [
        {
          label: 'Total Raciones Hoy',
          value: String(data.racionesEntregadasHoy),
          icon: Utensils,
          iconClass: 'bg-primary/15 text-primary',
        },
        {
          label: 'Total Insumos',
          value: String(data.stockTotal.totalInsumos),
          unit: 'tipos',
          icon: Boxes,
          iconClass: 'bg-secondary/15 text-secondary',
        },
        {
          label: 'Beneficiarios Activos',
          value: String(data.stockTotal.totalCategorias),
          icon: Users,
          iconClass: 'bg-chart-3/20 text-chart-3',
        },
        {
          label: 'Merma Promedio Semanal',
          value: `${data.mermaPromedioSemanal.toFixed(1)}%`,
          icon: TrendingDown,
          iconClass: data.mermaPromedioSemanal < 5
            ? 'bg-secondary/15 text-secondary'
            : 'bg-destructive/15 text-destructive',
        },
      ]
    : EMPTY_METRICS

  return (
    <section aria-label="Resumen del día">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article
              key={metric.label}
              className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div
                className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${metric.iconClass}`}
              >
                <Icon className="size-8" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-muted-foreground">
                  {metric.label}
                </p>
                <p className="font-heading text-4xl font-extrabold leading-tight text-card-foreground">
                  {loading ? (
                    <Loader2 className="size-7 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      {metric.value}
                      {metric.unit && (
                        <span className="ml-1 text-2xl font-bold text-muted-foreground">
                          {metric.unit}
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}