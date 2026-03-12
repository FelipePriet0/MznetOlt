'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { dashboardApi, type DashboardRecentEvent } from '@/lib/api/dashboard'
import { onuApi } from '@/lib/api/onu'
import { oltApi, type OltItem } from '@/lib/api/olt'
import { StatCardSkeleton, EventRowSkeleton } from '@/components/shared/skeleton'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Wifi, WifiOff, Clock,
  ShieldCheck, AlertTriangle, Activity, RefreshCw, MoreHorizontal,
} from 'lucide-react'

type TimeScale = 'hour' | 'day' | 'week' | 'month' | 'year'

function StatCard({
  label, value, secondary, icon: Icon, accent, onClick, bg, bright,
}: {
  label: string
  value: number | string
  secondary?: { label: string; value: number | string }[]
  icon: React.ElementType
  accent: 'primary' | 'success' | 'destructive' | 'warning' | 'muted'
  onClick?: () => void
  bg?: string
  bright?: boolean
}) {
  const accentMap = {
    primary:     'bg-primary/10 text-primary',
    success:     'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    warning:     'bg-warning/10 text-warning',
    muted:       'bg-muted text-muted-foreground',
  }

  const hoverCls = onClick ? (bg ? 'hover:brightness-110 cursor-pointer' : 'hover:bg-muted/30 cursor-pointer') : 'cursor-default'
  const iconCls  = bright ? 'bg-white/15 text-white' : accentMap[accent]
  const labelCls = bright ? 'text-sm font-medium text-white/80' : 'text-sm font-medium text-muted-foreground'
  const valueCls = bright ? 'text-3xl font-bold tracking-tight text-white' : 'text-3xl font-bold tracking-tight'
  const secondaryRowCls = bright ? 'flex items-center justify-between text-xs text-white/80' : 'flex items-center justify-between text-xs text-muted-foreground'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-left rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-4 transition-colors',
        hoverCls,
        bg && 'border-transparent',
        bg
      )}
    >
      <div className="flex items-center justify-between">
        <span className={labelCls}>{label}</span>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconCls)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className={valueCls}>{value}</p>
        {secondary && (
          <div className="mt-3 space-y-1.5">
            {secondary.map((s) => (
              <div key={s.label} className={secondaryRowCls}>
                <span>{s.label}</span>
                <span className={cn('font-medium tabular-nums', bright ? 'text-white' : 'text-foreground/90')}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  onu_authorized: { icon: ShieldCheck, color: 'text-success bg-success/10' },
  onu_offline:    { icon: WifiOff,     color: 'text-destructive bg-destructive/10' },
  onu_online:     { icon: Wifi,        color: 'text-success bg-success/10' },
}

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const sec = Math.round(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.round(hr / 24)
  return `${d}d ago`
}

function EventRow({ event }: { event: DashboardRecentEvent }) {
  const cfg  = EVENT_ICONS[event.event_type] ?? { icon: Activity, color: 'text-muted-foreground bg-muted' }
  const Icon = cfg.icon
  const label = event.event_type.replace(/_/g, ' ')
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0', cfg.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium capitalize truncate">{label}</p>
        {event.onu_serial && (
          <p className="text-xs text-muted-foreground font-mono">{event.onu_serial}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime(event.created_at)}</span>
    </div>
  )
}

function Dropdown({ label, items, onSelect }: { label: string; items: { key: string; label: string }[]; onSelect: (key: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(v => !v)}>
        {label}
        <MoreHorizontal className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-popover p-1 shadow-md z-20">
          {items.map(item => (
            <button
              key={item.key}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted"
              onClick={() => { onSelect(item.key); setOpen(false) }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SimpleAreaChart({ series, height = 160 }: { series: { name: string; color: string; values: number[] }[]; height?: number }) {
  const max = Math.max(1, ...series.flatMap(s => s.values))
  const points = (values: number[]) => values.map((v, i) => `${(i/(values.length-1))*100},${100 - (v/max)*100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      {series.map((s, idx) => (
        <g key={s.name} opacity={0.6 - idx*0.1}>
          <polyline fill="none" stroke={s.color} strokeWidth={1.5} points={points(s.values)} />
        </g>
      ))}
    </svg>
  )
}

function SimpleBarChart({ data, height = 160, color = 'hsl(var(--primary))' }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div className="flex items-end gap-1 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1">
          <div className="w-full rounded-t bg-primary" style={{ backgroundColor: color, height: `${(d.value/max)*100}%` }} />
          <div className="mt-1 text-[10px] text-muted-foreground text-center truncate">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [selectedOlt, setSelectedOlt] = useState<number | null>(null)
  const [scale, setScale] = useState<TimeScale>('day')
  const [oltPopoverOpen, setOltPopoverOpen] = useState(false)
  const [oltSearch, setOltSearch] = useState('')

  const summary = useApi(() => dashboardApi.summary())
  const signal  = useApi(() => dashboardApi.signalStats())
  const events  = useApi(() => dashboardApi.recentEvents(300))
  const olts    = useApi(() => oltApi.list({ page_size: 1000 }))

  // KPI counters (All or OLT specific)
  const [kpi, setKpi] = useState<Partial<{ waiting: number; online: number; offline: number; low: number }> | null>(null)
  const [kpiBreak, setKpiBreak] = useState<{
    waiting?: { denied?: number; resync?: number; new_onu?: number }
    online?: { total_authorized?: number }
    offline?: { power_fail?: number; loss_signal?: number; na_status?: number }
    low?: { warning?: number; critical?: number }
  }>({})
  const [kpiLoading, setKpiLoading] = useState(false)
  const [kpiErrors, setKpiErrors] = useState<{ waiting: string | null; online: string | null; offline: string | null; low: string | null }>({ waiting: null, online: null, offline: null, low: null })
  const [kpiUpdatedAt, setKpiUpdatedAt] = useState<number | null>(null)

  useEffect(() => {
    let abort = false
    async function computeKpi() {
      setKpiLoading(true)
      const nextErrors = { waiting: null as string | null, online: null as string | null, offline: null as string | null, low: null as string | null }
      let anySuccess = false

      if (!selectedOlt) {
        // Use existing hooks data to avoid duplicate requests
        if (summary.error) {
          nextErrors.waiting = 'summary'
          nextErrors.online  = 'summary'
          nextErrors.offline = 'summary'
        }
        if (signal.error) {
          nextErrors.low = 'signal'
        }
        const updates: Partial<{ waiting: number; online: number; offline: number; low: number }> = {}
        const bUpdates: typeof kpiBreak = {}
        if (summary.data) {
          updates.waiting = summary.data.unconfigured_onus
          updates.online  = summary.data.online_onus
          updates.offline = summary.data.offline_onus
          bUpdates.online = { total_authorized: summary.data.configured_onus }
          anySuccess = true
        }
        if (signal.data) {
          updates.low = signal.data.weak_signal_onus + signal.data.critical_signal_onus
          bUpdates.low = { warning: signal.data.weak_signal_onus, critical: signal.data.critical_signal_onus }
          anySuccess = true
        }
        if (!abort) {
          setKpi(prev => ({ ...(prev ?? {}), ...updates }))
          setKpiBreak(prev => ({ ...prev, ...bUpdates }))
          setKpiErrors(nextErrors)
          if (anySuccess) setKpiUpdatedAt(Date.now())
        }
      } else {
        // OLT-specific: compute each piece independently
        const updates: Partial<{ waiting: number; online: number; offline: number; low: number }> = {}
        const bUpdates: typeof kpiBreak = {}
        try {
          const online = await onuApi.list({ olt_id: selectedOlt, status: 'online', page_size: 1 }).then(r => r.total)
          updates.online = online
          anySuccess = true
        } catch (e) {
          nextErrors.online = 'onu:list'
        }
        try {
          const offline = await onuApi.list({ olt_id: selectedOlt, status: 'offline', page_size: 1 }).then(r => r.total)
          updates.offline = offline
          anySuccess = true
        } catch (e) {
          nextErrors.offline = 'onu:list'
        }
        try {
          const unconf = await onuApi.list({ olt_id: selectedOlt, status: 'unconfigured', page_size: 1 }).then(r => r.total)
          updates.waiting = unconf
          anySuccess = true
        } catch (e) {
          nextErrors.waiting = 'onu:list'
        }
        try {
          const configured = await onuApi.list({ olt_id: selectedOlt, status: 'configured', page_size: 1 }).then(r => r.total)
          bUpdates.online = { total_authorized: configured }
          anySuccess = true
        } catch {}
        try {
          const g = await dashboardApi.signalStats()
          let page = 1, pageSize = 200, low = 0, total = 0
          let warn = 0, crit = 0
          while (true) {
            const r = await onuApi.list({ olt_id: selectedOlt, page: page, page_size: pageSize })
            total = r.total
            for (const item of r.items) {
              if (item.last_known_signal !== null) {
                if (item.last_known_signal <= g.critical_threshold_dbm) { crit++; low++ }
                else if (item.last_known_signal <= g.warning_threshold_dbm) { warn++; low++ }
              }
            }
            if (page * pageSize >= total) break
            page++
          }
          updates.low = low
          bUpdates.low = { warning: warn, critical: crit }
          anySuccess = true
        } catch (e) {
          nextErrors.low = 'signal'
        }
        if (!abort) {
          setKpi(prev => ({ ...(prev ?? {}), ...updates }))
          setKpiBreak(prev => ({ ...prev, ...bUpdates }))
          setKpiErrors(nextErrors)
          if (anySuccess) setKpiUpdatedAt(Date.now())
        }
      }

      if (!abort) setKpiLoading(false)
    }
    computeKpi()
    return () => { abort = true }
  }, [selectedOlt, summary.data, summary.error, signal.data, signal.error])

  // Authorizations per day from recent events fallback
  const authPerDay = useMemo(() => {
    const items = (events.data?.items ?? []).filter(ev => ev.event_type === 'onu_authorized' && (!selectedOlt || ev.olt_id === selectedOlt))
    const map = new Map<string, number>()
    for (const ev of items) {
      const d = ev.created_at.slice(0, 10)
      map.set(d, (map.get(d) ?? 0) + 1)
    }
    const sorted = Array.from(map.entries()).sort(([a],[b]) => a < b ? -1 : 1).slice(-30)
    return sorted.map(([date, value]) => ({ label: date.slice(5), value }))
  }, [events.data, selectedOlt])

  function refetchAll() {
    summary.refetch(); signal.refetch(); events.refetch(); olts.refetch()
  }

  const filteredEvents = useMemo(() => {
    const all = events.data?.items ?? []
    return selectedOlt ? all.filter(e => e.olt_id === selectedOlt) : all
  }, [events.data, selectedOlt])

  // Network status area chart placeholder data (uses KPIs as snapshot)
  const areaSeries = useMemo(() => {
    const len = 12
    const base = kpi ? {
      online: kpi.online,
      powerFail: Math.round(kpi.offline * 0.4),
      signalLoss: Math.max(0, kpi.offline - Math.round(kpi.offline * 0.4)),
      na: Math.max(0, (kpi.waiting ?? 0)),
    } : { online: 0, powerFail: 0, signalLoss: 0, na: 0 }
    const mk = (v: number) => Array.from({ length: len }, (_, i) => Math.max(0, Math.round(v + Math.sin(i/2)*v*0.05)))
    return [
      { name: 'Online ONUs', color: 'hsl(var(--success))', values: mk(base.online) },
      { name: 'Power fail',  color: 'hsl(var(--destructive))', values: mk(base.powerFail) },
      { name: 'Signal loss', color: 'hsl(var(--warning))', values: mk(base.signalLoss) },
      { name: 'N/A',         color: 'hsl(var(--muted-foreground))', values: mk(base.na) },
    ]
  }, [kpi, scale])

  const oltsList = (olts.data?.items ?? []).filter(o => o.name.toLowerCase().includes(oltSearch.toLowerCase()))

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">SmartOLT-like operational overview</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main column */}
        <div className="lg:col-span-9 space-y-6">
          {/* KPI cards */}
          <div className="space-y-2">
            {Object.values(kpiErrors).some(Boolean) && (
              <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
                Some metrics couldn't update. Showing latest available data.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(() => {
                const w = kpi?.waiting
                const on = kpi?.online
                const off = kpi?.offline
                const low = kpi?.low
                const total = [w, on, off].every(v => typeof v === 'number')
                  ? Math.max(1, Number(w) + Number(on) + Number(off))
                  : null

                const display = (n?: number) => (typeof n === 'number' ? n : '—')

                return (
                  <>
                    {kpiLoading && !kpi ? (
                      Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                      <>
                        <StatCard
                          label="Waiting authorization"
                          value={display(w)}
                          secondary={[
                            { label: 'Denied', value: '—' },
                            { label: 'Resync', value: '—' },
                            { label: 'New ONU', value: '—' },
                          ]}
                          icon={Clock}
                          accent="warning"
                          onClick={() => router.push('/onus/unconfigured')}
                          bg="bg-[#0064C8]"
                          bright
                        />
                        <StatCard
                          label="Online"
                          value={display(on)}
                          secondary={[
                            { label: 'Total authorized', value: display(kpiBreak.online?.total_authorized) },
                          ]}
                          icon={Wifi}
                          accent="success"
                          onClick={() => router.push('/onus/configured')}
                          bg="bg-[#00783C]"
                          bright
                        />
                        <StatCard
                          label="Total offline"
                          value={display(off)}
                          secondary={[
                            { label: 'Power fail', value: '—' },
                            { label: 'Signal loss', value: '—' },
                            { label: 'N/A', value: '—' },
                          ]}
                          icon={WifiOff}
                          accent="destructive"
                          onClick={() => router.push('/onus/configured?status=offline')}
                          bg="bg-[#4C4B4B]"
                          bright
                        />
                        <StatCard
                          label="Low signals"
                          value={display(low)}
                          secondary={[
                            { label: 'Warning', value: display(kpiBreak.low?.warning) },
                            { label: 'Critical', value: display(kpiBreak.low?.critical) },
                          ]}
                          icon={AlertTriangle}
                          accent="primary"
                          onClick={() => router.push('/diagnostics?signal=critical,warning')}
                          bg="bg-[#F7A127]"
                          bright
                        />
                      </>
                    )}
                  </>
                )
              })()}
            </div>
            {kpiUpdatedAt && (
              <p className="text-[11px] text-muted-foreground">Last updated {new Date(kpiUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            )}
          </div>

          {/* Network status card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Network status</h2>
              <Dropdown
                label="More graphs"
                items={[
                  { key: 'hour',  label: 'Hourly graph' },
                  { key: 'day',   label: 'Daily graph' },
                  { key: 'week',  label: 'Weekly graph' },
                  { key: 'month', label: 'Monthly graph' },
                  { key: 'year',  label: 'Yearly graph' },
                ]}
                onSelect={k => setScale(k as TimeScale)}
              />
            </div>
            <SimpleAreaChart series={areaSeries} />
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(var(--success))' }} /> Online ONUs</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }} /> Power fail</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(var(--warning))' }} /> Signal loss</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> N/A</span>
            </div>
          </div>

          {/* ONU authorizations per day */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">ONU authorizations per day</h2>
            </div>
            {events.loading ? (
              <div className="h-40 w-full animate-pulse rounded bg-muted" />
            ) : (
              <SimpleBarChart data={authPerDay} />
            )}
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Activity feed</h2>
              </div>
              <span className="text-xs text-muted-foreground">{filteredEvents.length} events</span>
            </div>
            <div className="px-6">
              {events.loading ? (
                Array.from({ length: 6 }).map((_, i) => <EventRowSkeleton key={i} />)
              ) : filteredEvents.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No recent events.</p>
              ) : (
                filteredEvents.map(ev => <EventRow key={ev.id} event={ev} />)
              )}
            </div>
          </div>
        </div>

        {/* OLT Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">OLTs</h2>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setOltPopoverOpen(v => !v)}>
                  {selectedOlt ? `OLT #${selectedOlt}` : 'All'}
                </Button>
                {oltPopoverOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-md border bg-popover p-2 shadow-md z-30">
                    <Input placeholder="Search OLT" value={oltSearch} onChange={e => setOltSearch(e.target.value)} className="h-8" />
                    <div className="mt-2 max-h-64 overflow-auto">
                      <button
                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted flex items-center justify-between"
                        onClick={() => { setSelectedOlt(null); setOltPopoverOpen(false) }}
                      >
                        All
                      </button>
                      {oltsList.map(o => (
                        <button
                          key={o.id}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted flex items-center justify-between"
                          onClick={() => { setSelectedOlt(o.id); setOltPopoverOpen(false) }}
                        >
                          <span className="truncate">[{o.id}] {o.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 space-y-3">
              {(olts.data?.items ?? []).map((o: OltItem) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.name}</p>
                    <p className="text-xs text-muted-foreground">ID {o.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">ONU: —</Badge>
                    <Badge variant="secondary">Temp: —</Badge>
                  </div>
                </div>
              ))}
              {olts.loading && <p className="text-xs text-muted-foreground">Loading OLTs…</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
