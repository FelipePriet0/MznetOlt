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
  ShieldCheck, AlertTriangle, Activity, ChevronDown, X,
} from 'lucide-react'

// Mapeamento de ID da OLT → foto canônica
// Adicione os arquivos em /public/olt-images/olt-{id}.jpg para exibir a foto real
const OLT_PHOTO_MAP: Record<number, number> = {
  10: 9, 11: 9,       // mesmo modelo que ID 9
  21: 5, 24: 5, 25: 5, // mesmo modelo que ID 5
}
function oltPhotoSrc(id: number): string {
  const canonical = OLT_PHOTO_MAP[id] ?? id
  return `/olt-images/olt-${canonical}.png`
}

// Graph scales removed

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

// Dropdown removed (graphs)

// StackedAreaChart removed (graphs)

// SimpleBarChart removed (graphs)

export default function DashboardPage() {
  const router = useRouter()
  const [selectedOlt, setSelectedOlt] = useState<number | null>(null)
  // scale removed (graphs)
  const [oltPopoverOpen, setOltPopoverOpen] = useState(false)
  const [oltSearch, setOltSearch] = useState('')

  const summary       = useApi(() => dashboardApi.summary())
  const signal        = useApi(() => dashboardApi.signalStats())
  const events        = useApi(() => dashboardApi.recentEvents(100))
  const olts          = useApi(() => oltApi.list({ page_size: 1000 }))
  // graphs removed: network status and auth-per-day

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
        // Reset KPI values to zero for the selected OLT while recomputing
        if (!abort) {
          setKpi({ waiting: 0, online: 0, offline: 0, low: 0 })
          setKpiBreak({ online: { total_authorized: 0 }, low: { warning: 0, critical: 0 } })
        }
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

  // Authorizations per day from real bank data
  // graphs removed

  function refetchAll() {
    summary.refetch(); signal.refetch(); events.refetch(); olts.refetch()
  }

  const filteredEvents = useMemo(() => {
    const all = events.data?.items ?? []
    return selectedOlt ? all.filter(e => e.olt_id === selectedOlt) : all
  }, [events.data, selectedOlt])

  // Network status area chart from real bank data
  // graphs removed

  const oltsList = (olts.data?.items ?? []).filter(o => o.name.toLowerCase().includes(oltSearch.toLowerCase()))

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">SmartOLT-like operational overview</p>
        </div>
        {/* Removed manual refresh CTA */}
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
                          icon={Clock}
                          accent="warning"
                          onClick={() => {
                            const base = '/onus/unconfigured'
                            const url = selectedOlt ? `${base}?olt_id=${selectedOlt}` : base
                            router.push(url)
                          }}
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
                          onClick={() => {
                            const base = '/onus/configured'
                            const url = selectedOlt ? `${base}?olt_id=${selectedOlt}` : base
                            router.push(url)
                          }}
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
                          onClick={() => {
                            const base = '/onus/configured?status=offline'
                            const url = selectedOlt ? `${base}&olt_id=${selectedOlt}` : base
                            router.push(url)
                          }}
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
                          onClick={() => {
                            const base = '/onus/configured?signal=warning,critical'
                            const url = selectedOlt ? `${base}&olt_id=${selectedOlt}` : base
                            router.push(url)
                          }}
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

          {/* Graphs removed: Network status */}

          {/* Graphs removed: Authorizations per day */}

          {/* Activity feed */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Activity feed</h2>
                <span className="text-xs text-muted-foreground ml-1">— eventos recentes de ONUs (autorização, online, offline)</span>
              </div>
              <span className="text-xs text-muted-foreground">{filteredEvents.length} eventos</span>
            </div>
            <div className="px-6 max-h-72 overflow-y-auto">
              {events.loading ? (
                Array.from({ length: 6 }).map((_, i) => <EventRowSkeleton key={i} />)
              ) : filteredEvents.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum evento recente.</p>
              ) : (
                filteredEvents.map(ev => <EventRow key={ev.id} event={ev} />)
              )}
            </div>
          </div>

          {/* Falhas em portas PON */}
          {(() => {
            const failures = filteredEvents.filter(ev =>
              ev.event_type === 'onu_power_fail' || ev.event_type === 'onu_signal_loss'
            )
            const byOlt = new Map<number | null, typeof failures>()
            for (const ev of failures) {
              const arr = byOlt.get(ev.olt_id) ?? []
              arr.push(ev)
              byOlt.set(ev.olt_id, arr)
            }
            const rows = Array.from(byOlt.entries()).map(([olt_id, evs]) => {
              const olt = (olts.data?.items ?? []).find((o: OltItem) => o.id === olt_id)
              const powerFail   = evs.filter(e => e.event_type === 'onu_power_fail').length
              const signalLoss  = evs.filter(e => e.event_type === 'onu_signal_loss').length
              const cause = powerFail > signalLoss ? 'Falta de energia' : powerFail < signalLoss ? 'Perda de sinal' : 'Misto'
              return { olt_id, oltName: olt?.name ?? `OLT #${olt_id}`, impacted: evs.length, powerFail, signalLoss, cause }
            }).sort((a, b) => b.impacted - a.impacted)

            return (
              <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-6 py-4">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h2 className="text-sm font-semibold">Falhas em portas PON</h2>
                  <span className="text-xs text-muted-foreground ml-1">— últimas 24h</span>
                </div>
                {events.loading ? (
                  <div className="px-6 py-4 space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 rounded bg-muted animate-pulse" />)}
                  </div>
                ) : rows.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma falha registrada.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                          <th className="px-4 py-2 text-left font-medium">OLT</th>
                          <th className="px-4 py-2 text-right font-medium">ONUs impactadas</th>
                          <th className="px-4 py-2 text-right font-medium">Power fail</th>
                          <th className="px-4 py-2 text-right font-medium">Perda de sinal</th>
                          <th className="px-4 py-2 text-left font-medium">Causa provável</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rows.map(r => (
                          <tr key={r.olt_id ?? 'null'} className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-medium truncate max-w-[120px]">{r.oltName}</td>
                            <td className="px-4 py-2 text-right tabular-nums">{r.impacted}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-destructive">{r.powerFail}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-warning">{r.signalLoss}</td>
                            <td className="px-4 py-2 text-muted-foreground">{r.cause}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* OLT Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">

            {selectedOlt ? (() => {
              const olt = (olts.data?.items ?? []).find((o: OltItem) => o.id === selectedOlt)
              return (
                <>
                  {/* Header com nome + dropdown para trocar */}
                  <div className="flex items-center justify-between border-b px-4 py-3 gap-2">
                    <div className="relative flex-1 min-w-0">
                      <button
                        type="button"
                        className="w-full flex items-center gap-1.5 text-left"
                        onClick={() => setOltPopoverOpen(v => !v)}
                      >
                        <span className="text-sm font-semibold truncate">{olt?.name ?? `OLT #${selectedOlt}`}</span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                      {oltPopoverOpen && (
                        <div className="absolute left-0 mt-2 w-72 rounded-md border bg-popover p-2 shadow-md z-30">
                          <Input placeholder="Buscar OLT…" value={oltSearch} onChange={e => setOltSearch(e.target.value)} className="h-8" />
                          <div className="mt-2 max-h-64 overflow-auto">
                            <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted"
                              onClick={() => { setSelectedOlt(null); setOltPopoverOpen(false) }}>
                              Todas as OLTs
                            </button>
                            {oltsList.map((o: OltItem) => (
                              <button key={o.id}
                                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted"
                                onClick={() => { setSelectedOlt(o.id); setOltPopoverOpen(false) }}>
                                [{o.id}] {o.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => setSelectedOlt(null)}
                      className="shrink-0 rounded-md p-1 hover:bg-muted text-muted-foreground" title="Ver todas">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Foto da OLT */}
                  <div className="relative w-full aspect-[4/3] bg-muted">
                    {/* Placeholder (fica atrás, z-0) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2 z-0">
                      <svg className="h-12 w-12 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                        <rect x="2" y="3" width="20" height="5" rx="1"/>
                        <rect x="2" y="10" width="20" height="5" rx="1"/>
                        <rect x="2" y="17" width="20" height="5" rx="1"/>
                        <circle cx="19" cy="5.5" r="0.8" fill="currentColor"/>
                        <circle cx="19" cy="12.5" r="0.8" fill="currentColor"/>
                        <circle cx="19" cy="19.5" r="0.8" fill="currentColor"/>
                      </svg>
                      <span className="text-xs text-muted-foreground text-center">Sem foto disponível</span>
                    </div>
                    {/* Foto (fica na frente, z-10) */}
                    <img
                      src={oltPhotoSrc(selectedOlt)}
                      alt={olt?.name ?? `OLT ${selectedOlt}`}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>

                  {/* Info abaixo da foto */}
                  <div className="px-4 py-3 space-y-1">
                    <p className="text-xs text-muted-foreground">OLT selecionada</p>
                    <p className="text-sm font-medium">{olt?.name ?? `#${selectedOlt}`}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uptime: <span className="text-foreground font-medium">N/A</span>
                    </p>
                  </div>
                </>
              )
            })() : (
              <>
                {/* Lista de OLTs (padrão) */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h2 className="text-sm font-semibold">OLTs</h2>
                  <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setOltPopoverOpen(v => !v)}>
                      Todas <ChevronDown className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    {oltPopoverOpen && (
                      <div className="absolute right-0 mt-2 w-72 rounded-md border bg-popover p-2 shadow-md z-30">
                        <Input placeholder="Buscar OLT…" value={oltSearch} onChange={e => setOltSearch(e.target.value)} className="h-8" />
                        <div className="mt-2 max-h-64 overflow-auto">
                          {oltsList.map((o: OltItem) => (
                            <button key={o.id}
                              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted"
                              onClick={() => { setSelectedOlt(o.id); setOltPopoverOpen(false) }}>
                              [{o.id}] {o.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {(olts.data?.items ?? []).map((o: OltItem) => (
                    <button key={o.id} type="button"
                      className="w-full text-left flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedOlt(o.id)}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{o.name}</p>
                        <p className="text-xs text-muted-foreground">ID {o.id}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">ONU: —</Badge>
                    </button>
                  ))}
                  {olts.loading && <p className="text-xs text-muted-foreground">Carregando OLTs…</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
