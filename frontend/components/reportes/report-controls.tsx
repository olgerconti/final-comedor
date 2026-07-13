'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Download, Check } from 'lucide-react'

function generatePeriods(): { label: string; value: string }[] {
  const periods: { label: string; value: string }[] = []
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const value = `${year}-${String(month + 1).padStart(2, '0')}`
    const label = `${monthNames[month]} ${year}`
    periods.push({ label, value })
  }
  return periods
}

type ReportControlsProps = {
  selected: string
  onSelect: (value: string) => void
  onExportPdf?: () => void
  exporting?: boolean
}

export function ReportControls({
  selected,
  onSelect,
  onExportPdf,
  exporting,
}: ReportControlsProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const periods = useMemo(() => generatePeriods(), [])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLabel = useMemo(
    () => periods.find((p) => p.value === selected)?.label ?? selected,
    [periods, selected],
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div ref={containerRef} className="relative">
        <label id="periodo-label" className="sr-only">
          Seleccionar mes y año del reporte
        </label>
        <button
          type="button"
          aria-labelledby="periodo-label"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-full min-w-[200px] items-center justify-between gap-3 rounded-xl border-2 border-border bg-card px-5 text-lg font-bold text-card-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
        >
          <span>
            <span className="mr-2 text-base font-semibold text-muted-foreground">
              Periodo:
            </span>
            {selectedLabel}
          </span>
          <ChevronDown
            className={`size-6 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-labelledby="periodo-label"
            className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-2 shadow-lg"
          >
            {periods.map((period) => {
              const isSelected = period.value === selected
              return (
                <li key={period.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(period.value)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-lg font-semibold transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'text-popover-foreground hover:bg-muted'
                    }`}
                  >
                    {period.label}
                    {isSelected && (
                      <Check className="size-5 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {onExportPdf && (
        <button
          type="button"
          onClick={onExportPdf}
          disabled={exporting}
          className="flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-secondary bg-transparent px-6 text-lg font-bold text-secondary shadow-sm transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:opacity-50"
        >
          <Download className="size-6" aria-hidden="true" />
          Exportar a PDF
        </button>
      )}
    </div>
  )
}