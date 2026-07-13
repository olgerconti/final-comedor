'use client'

import { useMemo, useState, useEffect } from 'react'
import { Search, Plus, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchLotes, fetchInsumos, createLote, extractErrorMessage } from '@/lib/api'
import type { LoteResponse, InsumoResponse } from '@/types'

function formatDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function daysUntil(iso: string) {
  if (!iso) return 9999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${iso}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function InventoryTable() {
  const [query, setQuery] = useState('')
  const [lotes, setLotes] = useState<LoteResponse[]>([])
  const [insumos, setInsumos] = useState<InsumoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formInsumoId, setFormInsumoId] = useState('')
  const [formCantidad, setFormCantidad] = useState('')
  const [formVencimiento, setFormVencimiento] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [lotesData, insumosData] = await Promise.all([
          fetchLotes(),
          fetchInsumos(),
        ])
        if (!cancelled) {
          setLotes(lotesData)
          setInsumos(insumosData)
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return lotes
      .filter(
        (l) =>
          q === '' ||
          l.nombreInsumo.toLowerCase().includes(q) ||
          String(l.idLote).includes(q),
      )
      .sort(
        (a, b) =>
          new Date(a.fechaVencimiento || '').getTime() -
          new Date(b.fechaVencimiento || '').getTime(),
      )
  }, [lotes, query])

  async function handleCreateLote(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    const cantidadNum = Number(formCantidad)
    if (!formInsumoId || cantidadNum <= 0 || !formVencimiento) {
      setFormError('Complete todos los campos correctamente.')
      return
    }
    setFormSubmitting(true)
    try {
      const nuevo = await createLote({
        idInsumo: Number(formInsumoId),
        cantidad: cantidadNum,
        fechaVencimiento: formVencimiento,
      })
      setLotes((prev) => [...prev, nuevo])
      setShowForm(false)
      setFormInsumoId('')
      setFormCantidad('')
      setFormVencimiento('')
    } catch (err) {
      setFormError(extractErrorMessage(err))
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="inventario-titulo" className="flex flex-col gap-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar insumo o lote..."
            aria-label="Buscar insumo o lote"
            className="h-14 w-full rounded-xl border-2 border-border bg-card pl-12 pr-4 text-lg font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px"
        >
          <Plus className="size-6" aria-hidden="true" />
          Nuevo Ingreso
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateLote}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h3 className="mb-4 font-heading text-xl font-bold text-card-foreground">
            Registrar Nuevo Ingreso de Lote
          </h3>
          {formError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-base font-semibold text-destructive"
            >
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="insumo-select" className="text-base font-semibold">
                Insumo
              </label>
              <select
                id="insumo-select"
                required
                value={formInsumoId}
                onChange={(e) => setFormInsumoId(e.target.value)}
                className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base font-medium"
              >
                <option value="">Seleccione un insumo</option>
                {insumos.map((i) => (
                  <option key={i.idInsumo} value={i.idInsumo}>
                    {i.nombre} ({i.unidadMedida} - {i.categoria})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cantidad-lote" className="text-base font-semibold">
                Cantidad
              </label>
              <input
                id="cantidad-lote"
                type="number"
                min={0.01}
                step="0.01"
                required
                value={formCantidad}
                onChange={(e) => setFormCantidad(e.target.value)}
                placeholder="0"
                className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="vencimiento-lote" className="text-base font-semibold">
                Fecha de Vencimiento
              </label>
              <input
                id="vencimiento-lote"
                type="date"
                required
                value={formVencimiento}
                onChange={(e) => setFormVencimiento(e.target.value)}
                className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base font-medium"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={formSubmitting}
              className="flex-1 rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {formSubmitting ? (
                <Loader2 className="mx-auto size-5 animate-spin" />
              ) : (
                'Registrar Ingreso'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-muted px-6 py-3 text-base font-bold text-muted-foreground hover:bg-muted/70"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-border bg-muted">
                  <th className="px-5 py-4 text-base font-bold text-foreground">ID Lote</th>
                  <th className="px-5 py-4 text-base font-bold text-foreground">Producto</th>
                  <th className="px-5 py-4 text-right text-base font-bold text-foreground">
                    Cantidad Actual
                  </th>
                  <th className="px-5 py-4 text-base font-bold text-foreground">
                    <span className="flex items-center gap-1">
                      Fecha de Vencimiento
                      <span aria-hidden="true" className="text-primary">↑</span>
                    </span>
                    <span className="sr-only">ordenado ascendente por método PEPS</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const dias = row.diasRestantes ?? daysUntil(row.fechaVencimiento)
                  const urgente = dias < 3
                  const proximo = dias >= 3 && dias <= 7
                  return (
                    <tr
                      key={row.idLote}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-5 py-4 font-mono text-base font-semibold text-muted-foreground">
                        #{row.idLote}
                      </td>
                      <td className="px-5 py-4 text-lg font-semibold text-card-foreground">
                        {row.nombreInsumo}
                      </td>
                      <td className="px-5 py-4 text-right text-lg font-bold tabular-nums text-card-foreground">
                        {row.cantidadActual.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-lg font-semibold tabular-nums',
                              urgente ? 'text-destructive' : 'text-card-foreground',
                            )}
                          >
                            {formatDate(row.fechaVencimiento)}
                          </span>
                          {urgente && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                              <AlertTriangle className="size-3.5" aria-hidden="true" />
                              {dias <= 0 ? 'Vence hoy' : `${dias}d`}
                            </span>
                          )}
                          {proximo && (
                            <span className="inline-flex items-center rounded-full bg-chart-3/25 px-2.5 py-1 text-xs font-bold text-foreground">
                              {`${dias}d`}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && !loading && (
            <p className="px-6 py-12 text-center text-lg text-muted-foreground">
              No se encontraron lotes que coincidan con la búsqueda.
            </p>
          )}
        </div>
      )}

      <p className="text-base text-muted-foreground">
        {'La tabla se ordena automáticamente por fecha de vencimiento (método PEPS / FIFO): use primero los lotes más próximos a caducar.'}
      </p>
    </section>
  )
}