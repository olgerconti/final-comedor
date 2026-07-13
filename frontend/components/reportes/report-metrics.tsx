'use client'

import { useEffect, useState } from 'react'
import { Utensils, Boxes, TrendingDown, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  fetchReporteMensual,
  fetchReporteBeneficiarios,
  fetchReporteMermas,
} from '@/lib/api'
import type {
  ReporteMensualResponse,
  ReporteBeneficiariosResponse,
  ReporteMermasResponse,
} from '@/types'

type Metric = {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  iconClass: string
  valueClass?: string
  note?: string
}

type ReportMetricsProps = {
  mes: string
}

export function ReportMetrics({ mes }: ReportMetricsProps) {
  const [mensual, setMensual] = useState<ReporteMensualResponse | null>(null)
  const [beneficiarios, setBeneficiarios] = useState<ReporteBeneficiariosResponse | null>(null)
  const [mermas, setMermas] = useState<ReporteMermasResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [m, b, mer] = await Promise.all([
          fetchReporteMensual(mes),
          fetchReporteBeneficiarios(mes),
          fetchReporteMermas(mes),
        ])
        if (!cancelled) {
          setMensual(m)
          setBeneficiarios(b)
          setMermas(mer)
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [mes])

  const mermaValue = mermas?.mermaPromedioGlobal ?? 0
  const mermaGood = mermaValue < 5

  const defaultMetrics: Metric[] = [
    { label: 'Raciones Entregadas', value: '—', icon: Utensils, iconClass: 'bg-primary/15 text-primary' },
    { label: 'Insumos Consumidos (salidas)', value: '—', icon: Boxes, iconClass: 'bg-secondary/15 text-secondary' },
    { label: 'Merma Promedio Registrada', value: '—', icon: TrendingDown, iconClass: 'bg-secondary/15 text-secondary' },
  ]

  const metrics: Metric[] = loading
    ? defaultMetrics
    : [
        {
          label: 'Raciones Entregadas',
          value: beneficiarios?.totalRacionesEntregadas != null
            ? String(beneficiarios.totalRacionesEntregadas)
            : '—',
          icon: Utensils,
          iconClass: 'bg-primary/15 text-primary',
          note: beneficiarios?.promedioDiario != null
            ? `Promedio diario: ${beneficiarios.promedioDiario.toFixed(1)}`
            : undefined,
        },
        {
          label: 'Insumos Consumidos (salidas)',
          value: mensual?.totalSalidas != null
            ? mensual.totalSalidas.toFixed(2)
            : '—',
          unit: 'total',
          icon: Boxes,
          iconClass: 'bg-secondary/15 text-secondary',
          note: mensual?.totalIngresos != null
            ? `Ingresos totales: ${mensual.totalIngresos.toFixed(2)}`
            : undefined,
        },
        {
          label: 'Merma Promedio Registrada',
          value: mermas ? `${mermaValue.toFixed(1)}%` : '—',
          icon: TrendingDown,
          iconClass: mermas
            ? mermaGood
              ? 'bg-secondary/15 text-secondary'
              : 'bg-destructive/15 text-destructive'
            : 'bg-secondary/15 text-secondary',
          valueClass: mermas ? (mermaGood ? 'text-secondary' : 'text-destructive') : undefined,
          note: mermas
            ? mermaGood
              ? 'Por debajo del umbral del 5%'
              : 'Por encima del umbral del 5%'
            : undefined,
        },
      ]

  return (
    <section aria-label="Resumen mensual del periodo">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article
              key={metric.label}
              className="flex items-start gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
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
                <p
                  className={`font-heading text-4xl font-extrabold leading-tight ${metric.valueClass ?? 'text-card-foreground'}`}
                >
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
                {metric.note && (
                  <p
                    className={`mt-1 text-sm font-semibold ${metric.valueClass ?? 'text-muted-foreground'}`}
                  >
                    {metric.note}
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}