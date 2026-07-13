'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

type ConfirmDialogProps = {
  open: boolean
  cantidad: string
  unidad: string
  insumo: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  cantidad,
  unidad,
  insumo,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle
              className="size-11 text-destructive"
              aria-hidden="true"
            />
          </div>

          <h2
            id="confirm-title"
            className="mt-5 font-heading text-2xl font-extrabold text-card-foreground"
          >
            Confirmar salida
          </h2>

          <p
            id="confirm-desc"
            className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            {'¿Está segura de registrar la salida de '}
            <span className="font-bold text-card-foreground">
              {cantidad} {unidad} de {insumo}
            </span>
            {'? Esta acción actualizará el inventario permanentemente.'}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-destructive px-6 py-4 text-xl font-bold text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive active:translate-y-px"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-muted px-6 py-4 text-xl font-bold text-muted-foreground shadow-sm transition-colors hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
