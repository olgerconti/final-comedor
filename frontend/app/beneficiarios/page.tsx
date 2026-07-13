'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { BeneficiariesTable } from '@/components/beneficiarios/beneficiaries-table'

export default function BeneficiariosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header>
            <h1
              id="padron-titulo"
              className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl"
            >
              Padrón de Beneficiarios
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Gestión del padrón y control de asistencia diaria del comedor.
            </p>
          </header>

          <BeneficiariesTable />
        </div>
      </main>
    </div>
  )
}