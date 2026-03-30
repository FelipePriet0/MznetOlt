"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function SelectField({
  valueId,
  options,
  placeholder = 'Selecione',
  onChange,
  searchable = true,
  disabled = false,
}: {
  valueId: number | null
  options: { id: number; name: string }[]
  placeholder?: string
  onChange: (id: number | null) => void
  searchable?: boolean
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const selected = options.find(o => o.id === valueId)?.name || placeholder
  const filtered = q ? options.filter(o => o.name.toLowerCase().includes(q.toLowerCase())) : options
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        className={cn(
          'w-full h-9 flex items-center justify-between gap-1 rounded-md border border-input bg-background px-2.5 text-sm hover:bg-muted transition-colors',
          open && 'border-ring ring-2 ring-ring ring-offset-2 ring-offset-background',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="truncate text-left">{selected}</span>
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1 min-w-[200px] w-full rounded-md border border-input bg-popover p-1 shadow-lg">
          {searchable && (
            <div className="p-1">
              <input
                autoFocus
                className="h-8 w-full rounded border px-2 text-xs"
                placeholder="Buscar..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
          )}
          <button
            className="w-full text-left px-3 py-1.5 text-xs rounded-sm hover:bg-muted"
            onClick={() => { onChange(null); setOpen(false) }}
          >
            {placeholder}
          </button>
          <div className="max-h-64 overflow-auto">
            {filtered.map(opt => (
              <button
                key={opt.id}
                className="w-full text-left px-3 py-1.5 text-xs rounded-sm hover:bg-muted"
                onClick={() => { onChange(opt.id); setOpen(false) }}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

