"use client"

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type BarDatum = { label: string; value: number }

export function SimpleBarChart({
  data,
  height = 180,
  yStep = 20,
  barColor = '#1D4ED8',
  className,
}: {
  data: BarDatum[]
  height?: number
  yStep?: number
  barColor?: string
  className?: string
}) {
  // Measure container width to make chart responsive to card size
  const containerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [containerW, setContainerW] = useState<number>(480)
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width)
        if (w > 0) setContainerW(w)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const max = Math.max(0, ...data.map(d => d.value))
  const yMax = Math.ceil(max / yStep) * yStep || yStep
  // Use container width (no horizontal scroll), keep a minimum for tiny cards
  const width = Math.max(280, containerW)
  const basePad = { left: 32, right: 8, top: 8 }
  const innerW = width - basePad.left - basePad.right
  const perBarSpace = innerW / Math.max(1, data.length)
  const gap = Math.max(4, Math.min(12, perBarSpace * 0.25))
  const barW = Math.max(6, perBarSpace - gap)

  // Determine label density to avoid overlap
  const minLabelSpacing = 36 // px per label to avoid collision
  const labelStep = Math.max(1, Math.ceil(minLabelSpacing / Math.max(1, perBarSpace)))
  const smallSpace = perBarSpace < 28
  const labelFont = smallSpace ? 9 : 10
  const labelRotate = perBarSpace < 32 ? -35 : 0
  const bottomPad = labelRotate !== 0 ? 44 : 28
  const padding = { ...basePad, bottom: bottomPad }
  const innerH = height - padding.top - padding.bottom
  const scaleY = (v: number) => innerH - (v / yMax) * innerH

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const step = barW + gap
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((relX - padding.left - barW / 2) / step)))
    setHover({ i: idx, x: relX, y: relY })
  }

  function handleLeave() {
    setHover(null)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {!mounted ? (
        <div style={{ height }} />
      ) : (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {/* Y grid */}
        {Array.from({ length: Math.floor(yMax / yStep) + 1 }).map((_, i) => {
          const yVal = i * yStep
          const y = scaleY(yVal)
          return (
            <g key={i}>
              <line x1={padding.left} y1={padding.top + y} x2={width - padding.right} y2={padding.top + y} stroke="#eee" />
              <text x={padding.left - 6} y={padding.top + y + 4} fontSize={10} textAnchor="end" fill="#6b7280">{yVal}</text>
            </g>
          )
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const x = padding.left + i * (barW + gap)
          const yTop = scaleY(d.value)
          const h = (yMax === 0 ? 0 : (d.value / yMax) * innerH)
          return (
            <rect key={i} x={x} y={padding.top + yTop} width={barW} height={h} fill={barColor} rx={2} />
          )
        })}
        {/* X labels */}
        {data.map((d, i) => {
          if (i % labelStep !== 0) return null
          const x = padding.left + i * (barW + gap) + barW / 2
          if (labelRotate !== 0) {
            return (
              <g key={i} transform={`translate(${x},${height - padding.bottom + 18}) rotate(${labelRotate})`}>
                <text x={0} y={0} fontSize={labelFont} textAnchor="end" fill="#6b7280">{d.label}</text>
              </g>
            )
          }
          return (
            <text key={i} x={x} y={height - 8} fontSize={labelFont} textAnchor="middle" fill="#6b7280">
              {d.label}
            </text>
          )
        })}
      </svg>
      )}
      {hover && data[hover.i] && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border bg-popover px-2 py-1 text-popover-foreground shadow-md"
          style={{
            left: Math.min(Math.max(hover.x + 8, 8), width - 140),
            top: Math.min(Math.max(hover.y - 36, 8), height - 40),
            fontSize: 12,
          }}
        >
          <div className="font-medium">{data[hover.i].label}</div>
          <div className="text-xs text-muted-foreground">{data[hover.i].value}</div>
        </div>
      )}
    </div>
  )
}

type StackedPoint = { x: string; series: Record<string, number> }

export function SimpleStackedArea({
  data,
  colors,
  height = 220,
  className,
}: {
  data: StackedPoint[]
  colors: Record<string, string>
  height?: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [containerW, setContainerW] = useState<number>(520)
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width)
        if (w > 0) setContainerW(w)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const width = Math.max(320, containerW)
  const basePad = { left: 40, right: 10, top: 8 }
  const innerW = width - basePad.left - basePad.right
  const keys = Object.keys(colors)

  const totals = data.map(d => keys.reduce((acc, k) => acc + (d.series[k] || 0), 0))
  const yMax = Math.max(1, Math.ceil((Math.max(0, ...totals)) / 10) * 10)

  const scaleX = (i: number) => (innerW / Math.max(1, data.length - 1)) * i
  
  // Determine label density to avoid overlap on X
  const perTick = data.length > 1 ? innerW / (data.length - 1) : innerW
  const minTickSpacing = 48
  const labelStep = Math.max(1, Math.ceil(minTickSpacing / Math.max(1, perTick)))
  const smallSpace = perTick < 36
  const labelFont = smallSpace ? 9 : 10
  const labelRotate = perTick < 44 ? -35 : 0
  const bottomPad = labelRotate !== 0 ? 50 : 28
  const padding = { ...basePad, bottom: bottomPad }
  const innerH = height - padding.top - padding.bottom
  const scaleY = (v: number) => innerH - (v / yMax) * innerH

  // Build stacked areas from bottom to top
  const paths = keys.map((k, ki) => {
    let accPrev = Array(data.length).fill(0)
    for (let j = 0; j < ki; j++) {
      const prevKey = keys[j]
      accPrev = accPrev.map((av, idx) => av + (data[idx]?.series[prevKey] || 0))
    }
    const top = data.map((d, idx) => (accPrev[idx] + (d.series[k] || 0)))
    const bottom = accPrev
    // Path from left to right on top, then back on bottom
    const topD = data.map((_, i) => `L ${padding.left + scaleX(i)} ${padding.top + scaleY(top[i])}`).join(' ').replace(/^L /, 'M ')
    const bottomD = data.slice().reverse().map((_, rIndex) => {
      const i = data.length - 1 - rIndex
      return `L ${padding.left + scaleX(i)} ${padding.top + scaleY(bottom[i])}`
    }).join(' ')
    const dAttr = `${topD} ${bottomD} Z`
    return { key: k, d: dAttr }
  })

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const step = data.length > 1 ? innerW / (data.length - 1) : innerW
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((relX - padding.left) / step)))
    const total = keys.reduce((acc, k) => acc + (data[idx]?.series[k] || 0), 0)
    const y = padding.top + scaleY(total)
    setHover({ i: idx, x: relX, y })
  }
  function handleLeave() { setHover(null) }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {!mounted ? (
        <div style={{ height }} />
      ) : (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {/* Y grid */}
        {Array.from({ length: 6 }).map((_, i) => {
          const yVal = Math.round((yMax / 5) * i)
          const y = scaleY(yVal)
          return (
            <g key={i}>
              <line x1={padding.left} y1={padding.top + y} x2={width - padding.right} y2={padding.top + y} stroke="#eee" />
              <text x={padding.left - 6} y={padding.top + y + 4} fontSize={10} textAnchor="end" fill="#6b7280">{yVal}</text>
            </g>
          )
        })}
        {/* Areas */}
        {paths.map(p => (
          <path key={p.key} d={p.d} fill={colors[p.key]} opacity={0.85} />
        ))}
        {/* X labels */}
        {data.map((d, i) => {
          if (i % labelStep !== 0) return null
          const x = padding.left + scaleX(i)
          if (labelRotate !== 0) {
            return (
              <g key={i} transform={`translate(${x},${height - padding.bottom + 18}) rotate(${labelRotate})`}>
                <text x={0} y={0} fontSize={labelFont} textAnchor="end" fill="#6b7280">{d.x}</text>
              </g>
            )
          }
          return (
            <text key={i} x={x} y={height - 8} fontSize={labelFont} textAnchor="middle" fill="#6b7280">{d.x}</text>
          )
        })}
      </svg>
      )}
      {hover && data[hover.i] && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border bg-popover px-2 py-1 text-popover-foreground shadow-md"
          style={{
            left: Math.min(Math.max(hover.x + 8, 8), width - 180),
            top: Math.min(Math.max(hover.y - 40, 8), height - 60),
            fontSize: 12,
          }}
        >
          <div className="font-medium">{data[hover.i].x}</div>
          {keys.map(k => (
            <div key={k} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: colors[k] }} />
              <span className="capitalize">{k}</span>
              <span className="ml-auto text-foreground">{data[hover.i].series[k] ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
