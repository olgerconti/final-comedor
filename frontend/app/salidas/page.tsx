'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { SalidaModule } from '@/components/salidas/salida-module'

export default function SalidasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <header>
            <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Salida de Insumos
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Registre el retiro de insumos del inventario del comedor.
            </p>
          </header>

          <SalidaModule />
        </div>
      </main>
    </div>
  )
}