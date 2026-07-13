'use client'

import { useEffect, useMemo, useState } from 'react'
import { PackageMinus, ChevronDown, Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/salidas/confirm-dialog'
import { CheckoutsTable } from '@/components/salidas/checkouts-table'
import { fetchInsumos, registrarSalida, extractErrorMessage } from '@/lib/api'
import type { InsumoResponse, MovimientoSalidaResponse } from '@/types'

export function SalidaModule() {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([])
  const [loadingInsumos, setLoadingInsumos] = useState(true)
  const [insumosError, setInsumosError] = useState('')

  const [insumoId, setInsumoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [pesoBruto, setPesoBruto] = useState('')
  const [pesoNeto, setPesoNeto] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [lastResult, setLastResult] = useState<MovimientoSalidaResponse | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchInsumos()
        if (!cancelled) {
          setInsumos(data)
          if (data.length > 0) setInsumoId(String(data[0].idInsumo))
        }
      } catch (err) {
        if (!cancelled) setInsumosError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setLoadingInsumos(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const selectedInsumo = useMemo(
    () => insumos.find((i) => String(i.idInsumo) === insumoId) ?? null,
    [insumos, insumoId],
  )
  const unidad = selectedInsumo?.unidadMedida ?? ''
  const nombreInsumo = selectedInsumo?.nombre ?? ''
  const cantidadValida = Number(cantidad) > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cantidadValida || !insumoId) return
    setSubmitError('')
    setDialogOpen(true)
  }

  async function handleConfirm() {
    setDialogOpen(false)
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload: { idInsumo: number; cantidad: number; pesoBruto?: number; pesoNeto?: number } = {
        idInsumo: Number(insumoId),
        cantidad: Number(cantidad),
      }
      if (pesoBruto.trim()) payload.pesoBruto = Number(pesoBruto)
      if (pesoNeto.trim()) payload.pesoNeto = Number(pesoNeto)

      const res = await registrarSalida(payload)
      setLastResult(res)
      setCantidad('')
      setPesoBruto('')
      setPesoNeto('')
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setSubmitError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {insumosError && (
        <div
          role="alert"
          className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
        >
          {insumosError}
        </div>
      )}

      <section aria-labelledby="form-titulo">
        <h2
          id="form-titulo"
          className="mb-4 font-heading text-2xl font-bold text-foreground"
        >
          Registrar salida de insumo
        </h2>

        {submitError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
          >
            {submitError}
          </div>
        )}

        {lastResult && (
          <div
            role="status"
            className="mb-4 rounded-xl border-2 border-secondary/40 bg-secondary/10 px-4 py-3 text-base font-semibold text-secondary"
          >
            {lastResult.mensaje}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          {loadingInsumos ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-7 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="insumo-select"
                  className="text-lg font-semibold text-card-foreground"
                >
                  Seleccionar Insumo
                </label>
                <div className="relative">
                  <select
                    id="insumo-select"
                    value={insumoId}
                    onChange={(e) => setInsumoId(e.target.value)}
                    className="h-16 w-full appearance-none rounded-xl border-2 border-border bg-background px-4 pr-12 text-lg font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    {insumos.map((i) => (
                      <option key={i.idInsumo} value={i.idInsumo}>
                        {i.nombre} ({i.unidadMedida})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cantidad-salida"
                  className="text-lg font-semibold text-card-foreground"
                >
                  Cantidad a retirar ({unidad})
                </label>
                <input
                  id="cantidad-salida"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="0"
                  className="h-16 w-full rounded-xl border-2 border-border bg-background px-4 text-2xl font-bold text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="peso-bruto" className="text-lg font-semibold text-card-foreground">
                  Peso Bruto (opcional)
                </label>
                <input
                  id="peso-bruto"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={pesoBruto}
                  onChange={(e) => setPesoBruto(e.target.value)}
                  placeholder="Opcional"
                  className="h-16 w-full rounded-xl border-2 border-border bg-background px-4 text-xl font-bold text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="peso-neto" className="text-lg font-semibold text-card-foreground">
                  Peso Neto (opcional)
                </label>
                <input
                  id="peso-neto"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={pesoNeto}
                  onChange={(e) => setPesoNeto(e.target.value)}
                  placeholder="Opcional"
                  className="h-16 w-full rounded-xl border-2 border-border bg-background px-4 text-xl font-bold text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!cantidadValida || submitting || loadingInsumos}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-6 text-xl font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-7 animate-spin" aria-hidden="true" />
            ) : (
              <PackageMinus className="size-7" aria-hidden="true" />
            )}
            {submitting ? 'Registrando...' : 'Registrar Salida'}
          </button>
        </form>
      </section>

      <CheckoutsTable key={refreshKey} />

      <ConfirmDialog
        open={dialogOpen}
        cantidad={cantidad}
        unidad={unidad}
        insumo={nombreInsumo}
        onConfirm={handleConfirm}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  )
}