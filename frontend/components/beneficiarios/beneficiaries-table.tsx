'use client'

import { useMemo, useState, useEffect } from 'react'
import { Search, Plus, Pencil, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fetchBeneficiarios,
  fetchRaciones,
  registrarRacion,
  createBeneficiario,
  updateBeneficiario,
  extractErrorMessage,
  getTodayLocal,
} from '@/lib/api'
import type { BeneficiarioResponse, RacionResponse } from '@/types'

function AttendanceSwitch({
  checked,
  onToggle,
  label,
  disabled,
}: {
  checked: boolean
  onToggle: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50',
          checked
            ? 'border-secondary bg-secondary'
            : 'border-border bg-muted',
        )}
      >
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full bg-card shadow-md transition-transform',
            checked ? 'translate-x-7' : 'translate-x-0.5',
          )}
        >
          {checked && (
            <Check className="size-4 text-secondary" aria-hidden="true" strokeWidth={3} />
          )}
        </span>
      </button>
      <span
        className={cn(
          'text-base font-bold',
          checked ? 'text-secondary' : 'text-muted-foreground',
        )}
        aria-hidden="true"
      >
        {checked ? 'Sí' : 'No'}
      </span>
    </div>
  )
}

export function BeneficiariesTable() {
  const [query, setQuery] = useState('')
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioResponse[]>([])
  const [racionesHoy, setRacionesHoy] = useState<RacionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [togglingDni, setTogglingDni] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formDni, setFormDni] = useState('')
  const [formNombresApellidos, setFormNombresApellidos] = useState('')
  const [formCondicion, setFormCondicion] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const hoy = getTodayLocal()

        const [bens, racs] = await Promise.all([
          fetchBeneficiarios(),
          fetchRaciones({ fecha: hoy }),
        ])
        if (!cancelled) {
          setBeneficiarios(bens)
          setRacionesHoy(racs)
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

  const racionesPorId = useMemo(() => {
    const map = new Map<number, RacionResponse>()
    for (const r of racionesHoy) {
      map.set(r.idBeneficiario, r)
    }
    return map
  }, [racionesHoy])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return beneficiarios
    return beneficiarios.filter(
      (b) =>
        b.dni.includes(q) ||
        b.nombresApellidos.toLowerCase().includes(q) ||
        String(b.idBeneficiario).includes(q),
    )
  }, [beneficiarios, query])

  async function toggleEntrega(ben: BeneficiarioResponse) {
    const yaEntregada = racionesPorId.has(ben.idBeneficiario)
    if (yaEntregada) return
    setTogglingDni(ben.dni)
    setActionError('')
    try {
      const hoy = getTodayLocal()
      const racion = await registrarRacion({
        idBeneficiario: ben.idBeneficiario,
        fechaEntrega: hoy,
      })
      setRacionesHoy((prev) => [...prev, racion])
    } catch (err) {
      setActionError(extractErrorMessage(err))
    } finally {
      setTogglingDni(null)
    }
  }

  function openNewForm() {
    setEditingId(null)
    setFormDni('')
    setFormNombresApellidos('')
    setFormCondicion('')
    setFormError('')
    setShowForm(true)
  }

  function openEditForm(b: BeneficiarioResponse) {
    setEditingId(b.idBeneficiario)
    setFormDni(b.dni)
    setFormNombresApellidos(b.nombresApellidos)
    setFormCondicion(b.condicion)
    setFormError('')
    setShowForm(true)
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSubmitting(true)
    try {
      const payload = { dni: formDni, nombresApellidos: formNombresApellidos, condicion: formCondicion }
      if (editingId) {
        const updated = await updateBeneficiario(editingId, payload)
        setBeneficiarios((prev) =>
          prev.map((b) => (b.idBeneficiario === editingId ? updated : b))
        )
      } else {
        const created = await createBeneficiario(payload)
        setBeneficiarios((prev) => [...prev, created])
      }
      setShowForm(false)
      resetForm()
    } catch (err) {
      setFormError(extractErrorMessage(err))
    } finally {
      setFormSubmitting(false)
    }
  }

  function resetForm() {
    setEditingId(null)
    setFormDni('')
    setFormNombresApellidos('')
    setFormCondicion('')
    setFormError('')
  }

  const entregadasHoy = racionesHoy.length

  return (
    <section aria-labelledby="padron-titulo" className="flex flex-col gap-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
        >
          {error}
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
        >
          {actionError}
        </div>
      )}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por DNI o Nombre..."
          aria-label="Buscar beneficiario por DNI o nombre"
          className="h-16 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-4 text-lg font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>

      <p className="text-base font-semibold text-muted-foreground" aria-live="polite">
        Raciones entregadas hoy:{' '}
        <span className="text-secondary">{entregadasHoy}</span> de {beneficiarios.length}{' '}
        beneficiarios.
      </p>

      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h3 className="mb-4 font-heading text-xl font-bold text-card-foreground">
            {editingId ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}
          </h3>
          {formError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-base font-semibold text-destructive"
            >
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="form-dni" className="text-base font-semibold">
                DNI (8 dígitos)
              </label>
              <input
                id="form-dni"
                type="text"
                required
                pattern="\d{8}"
                maxLength={8}
                value={formDni}
                onChange={(e) => setFormDni(e.target.value.replace(/\D/g, ''))}
                placeholder="12345678"
                className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base font-medium"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <label htmlFor="form-nombres" className="text-base font-semibold">
                Nombres y Apellidos
              </label>
              <input
                id="form-nombres"
                type="text"
                required
                minLength={5}
                maxLength={200}
                value={formNombresApellidos}
                onChange={(e) => setFormNombresApellidos(e.target.value)}
                placeholder="María Quispe Huamán"
                className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="form-condicion" className="text-base font-semibold">
                Condición
              </label>
              <select
                id="form-condicion"
                required
                value={formCondicion}
                onChange={(e) => setFormCondicion(e.target.value)}
                className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base font-medium"
              >
                <option value="">Seleccione...</option>
                <option value="Adulto Mayor">Adulto Mayor</option>
                <option value="Madre Soltera">Madre Soltera</option>
                <option value="Discapacidad">Discapacidad</option>
                <option value="Menor de Edad">Menor de Edad</option>
              </select>
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
              ) : editingId ? (
                'Actualizar'
              ) : (
                'Registrar'
              )}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm() }}
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
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-border bg-muted">
                  <th className="px-5 py-4 text-base font-bold text-foreground">DNI</th>
                  <th className="px-5 py-4 text-base font-bold text-foreground">
                    Nombres y Apellidos
                  </th>
                  <th className="px-5 py-4 text-base font-bold text-foreground">Condición</th>
                  <th className="px-5 py-4 text-base font-bold text-foreground">
                    Ración Entregada Hoy
                  </th>
                  <th className="px-5 py-4 text-center text-base font-bold text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const yaEntregada = racionesPorId.has(b.idBeneficiario)
                  const isToggling = togglingDni === b.dni
                  return (
                    <tr
                      key={b.idBeneficiario}
                      className={cn(
                        'border-b border-border last:border-0 transition-colors',
                        yaEntregada ? 'bg-secondary/5' : 'hover:bg-muted/50',
                      )}
                    >
                      <td className="px-5 py-4 font-mono text-base font-semibold tabular-nums text-muted-foreground">
                        {b.dni}
                      </td>
                      <td className="px-5 py-4 text-lg font-semibold text-card-foreground">
                        {b.nombresApellidos}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
                          {b.condicion}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isToggling ? (
                          <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        ) : (
                          <AttendanceSwitch
                            checked={yaEntregada}
                            onToggle={() => toggleEntrega(b)}
                            label={
                              yaEntregada
                                ? `${b.nombresApellidos} ya recibió ración`
                                : `Marcar ración entregada hoy para ${b.nombresApellidos}`
                            }
                            disabled={yaEntregada}
                          />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(b)}
                            aria-label={`Editar beneficiario ${b.nombresApellidos}`}
                            className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            <Pencil className="size-5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="px-6 py-12 text-center text-lg text-muted-foreground">
              No se encontraron beneficiarios que coincidan con la búsqueda.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-start">
        <button
          type="button"
          onClick={openNewForm}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px"
        >
          <Plus className="size-6" aria-hidden="true" />
          Nuevo Beneficiario
        </button>
      </div>
    </section>
  )
}