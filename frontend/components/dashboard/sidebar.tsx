'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  FileBarChart,
  Menu,
  X,
  UtensilsCrossed,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Inventario', icon: Package, href: '/inventario' },
  { label: 'Salidas', icon: ClipboardList, href: '/salidas' },
  { label: 'Beneficiarios', icon: Users, href: '/beneficiarios' },
  { label: 'Reportes', icon: FileBarChart, href: '/reportes' },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-2" aria-label="Navegación principal">
      {navItems.map((item) => {
        const Icon = item.icon
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring',
              active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon className="size-6 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex size-12 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <UtensilsCrossed className="size-7" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className="font-heading text-lg font-bold text-sidebar-foreground">
          Comedor
        </p>
        <p className="text-sm text-sidebar-foreground/70">Comunitario</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de navegación"
          className="flex size-12 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
        >
          <Menu className="size-7" aria-hidden="true" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col gap-8 bg-sidebar p-6 lg:flex">
        <div className="pt-2">
          <Brand />
        </div>
        <NavLinks />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col gap-8 bg-sidebar p-6">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú de navegación"
                className="flex size-11 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
