'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ReportControls } from '@/components/reportes/report-controls'
import { ReportMetrics } from '@/components/reportes/report-metrics'
import { RotationTable } from '@/components/reportes/rotation-table'
import { Lock } from 'lucide-react'
import { getUserRole } from '@/lib/auth'

function getCurrentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function ReportesPage() {
  const [mes, setMes] = useState(getCurrentMonth())
  const role = getUserRole()
  const isSupervisor = role === 'Supervisor Municipal'

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          {isSupervisor && (
            <div
              role="status"
              className="flex items-center gap-4 rounded-2xl border-2 border-chart-3/40 bg-chart-3/15 px-5 py-4"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-chart-3/25 text-chart-3">
                <Lock className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-heading text-lg font-extrabold text-foreground">
                  Modo Solo Lectura
                </p>
                <p className="text-base font-semibold text-muted-foreground">
                  Supervisor Municipal — este perfil permite consultar y exportar
                  reportes, pero no modificar datos.
                </p>
              </div>
            </div>
          )}

          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                Reportes de Transparencia
              </h1>
              <p className="mt-1 text-lg text-muted-foreground">
                Resumen de gestión del comedor comunitario para auditoría.
              </p>
            </div>
            <ReportControls selected={mes} onSelect={setMes} />
          </header>

          <ReportMetrics mes={mes} />
          <RotationTable mes={mes} />
        </div>
      </main>
    </div>
  )
}