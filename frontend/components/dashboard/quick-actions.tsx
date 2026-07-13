'use client'

import { PackagePlus, UtensilsCrossed } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  return (
    <section aria-labelledby="acciones-titulo">
      <h2
        id="acciones-titulo"
        className="mb-4 font-heading text-2xl font-bold text-foreground"
      >
        Acciones Rápidas
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push('/salidas')}
          className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-7 text-xl font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px"
        >
          <UtensilsCrossed className="size-7" aria-hidden="true" />
          Nueva Salida
        </button>
        <button
          type="button"
          onClick={() => router.push('/beneficiarios')}
          className="flex items-center justify-center gap-3 rounded-2xl bg-secondary px-6 py-7 text-xl font-bold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px"
        >
          <PackagePlus className="size-7" aria-hidden="true" />
          Registrar Ración
        </button>
      </div>
    </section>
  )
}