'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ExpirationAlerts } from '@/components/dashboard/expiration-alerts'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <header>
            <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Resumen de la actividad del comedor de hoy.
            </p>
          </header>

          <QuickActions />
          <SummaryCards />
          <ExpirationAlerts />
        </div>
      </main>
    </div>
  )
}