"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

type CalendarMode = 'single'

export type CalendarProps = {
  mode?: CalendarMode
  selected?: Date
  onSelect?: (date?: Date) => void
  className?: string
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function Calendar({ mode = 'single', selected, onSelect, className }: CalendarProps) {
  const today = React.useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = React.useState<number>(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = React.useState<number>(selected?.getMonth() ?? today.getMonth())

  const weeks: (Date | null)[][] = React.useMemo(() => {
    const first = startOfMonth(viewYear, viewMonth)
    const firstWeekday = (first.getDay() + 6) % 7 // Mon=0
    const totalDays = daysInMonth(viewYear, viewMonth)
    const cells: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(viewYear, viewMonth, d))
    while (cells.length % 7 !== 0) cells.push(null)
    const rows: (Date | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [viewYear, viewMonth])

  function prevMonth() {
    const m = viewMonth - 1
    if (m < 0) {
      setViewYear(v => v - 1)
      setViewMonth(11)
    } else setViewMonth(m)
  }
  function nextMonth() {
    const m = viewMonth + 1
    if (m > 11) {
      setViewYear(v => v + 1)
      setViewMonth(0)
    } else setViewMonth(m)
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className={cn('inline-block rounded-lg border bg-card shadow-sm p-2', className)}>
      <div className="flex items-center justify-between px-2 py-1">
        <button className="h-7 w-7 rounded-md hover:bg-muted/60" onClick={() => setViewYear(v => v - 1)} aria-label="Ano anterior">«</button>
        <button className="h-7 w-7 rounded-md hover:bg-muted/60" onClick={prevMonth} aria-label="Mês anterior">‹</button>
        <div className="text-xs font-medium select-none capitalize">{monthLabel}</div>
        <button className="h-7 w-7 rounded-md hover:bg-muted/60" onClick={nextMonth} aria-label="Próximo mês">›</button>
        <button className="h-7 w-7 rounded-md hover:bg-muted/60" onClick={() => setViewYear(v => v + 1)} aria-label="Próximo ano">»</button>
      </div>
      <div className="grid grid-cols-7 gap-1 px-2 py-1 text-[11px] text-muted-foreground">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d) => (
          <div key={d} className="text-center select-none">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 px-2 pb-2">
        {weeks.flat().map((d, idx) => {
          if (!d) return <div key={idx} className="h-8" />
          const isToday = isSameDay(d, today)
          const isSel = isSameDay(d, selected)
          return (
            <button
              key={idx}
              className={cn(
                'h-8 rounded-md text-xs hover:bg-muted/80 transition-colors',
                isSel ? 'bg-primary text-primary-foreground' : isToday ? 'bg-muted' : 'bg-transparent'
              )}
              onClick={() => onSelect?.(d)}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarBasic() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg border" />
}

