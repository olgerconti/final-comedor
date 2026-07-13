import { Sidebar } from '@/components/dashboard/sidebar'
import { InventoryTable } from '@/components/inventario/inventory-table'

export default function InventarioPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header>
            <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Inventario y Lotes
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Control del stock físico y trazabilidad de lotes del comedor.
            </p>
          </header>

          <InventoryTable />
        </div>
      </main>
    </div>
  )
}
