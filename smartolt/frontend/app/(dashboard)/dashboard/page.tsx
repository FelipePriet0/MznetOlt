'use client'

import { useApi } from '@/hooks/use-api'
import { dashboardApi, type DashboardRecentEvent } from '@/lib/api/dashboard'
import { StatCardSkeleton, EventRowSkeleton } from '@/components/shared/skeleton'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import {
  Wifi, Smartphone, WifiOff, Clock,
  ShieldCheck, AlertTriangle, XCircle,
  RefreshCw, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ── Stat card ──────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  accent: 'primary' | 'success' | 'destructive' | 'warning' | 'muted'
}) {
  const accentMap = {
    primary:     'bg-primary/10 text-primary',
    success:     'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    warning:     'bg-warning/10 text-warning',
    muted:       'bg-muted text-muted-foreground',
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', accentMap[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Signal bar ─────────────────────────────────────────────── */
function SignalBar({ label, value, total, variant }: {
  label: string
  value: number
  total: number
  variant: 'success' | 'warning' | 'destructive'
}) {
  const pct   = total > 0 ? Math.round((value / total) * 100) : 0
  const color = {
    success:     'bg-success',
    warning:     'bg-warning',
    destructive: 'bg-destructive',
  }[variant]

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ── Event row ──────────────────────────────────────────────── */
const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  onu_authorized: { icon: ShieldCheck, color: 'text-success bg-success/10' },
  onu_offline:    { icon: WifiOff,     color: 'text-destructive bg-destructive/10' },
  onu_online:     { icon: Wifi,        color: 'text-success bg-success/10' },
  olt_sync:       { icon: RefreshCw,   color: 'text-primary bg-primary/10' },
}

function EventRow({ event }: { event: DashboardRecentEvent }) {
  const cfg  = EVENT_ICONS[event.event_type] ?? { icon: Activity, color: 'text-muted-foreground bg-muted' }
  const Icon = cfg.icon
  const time = new Date(event.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
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
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  )
}

/* ── Sync status dot ────────────────────────────────────────── */
function SyncDot({ status }: { status: string | undefined }) {
  if (!status) return <StatusBadge status="pending" label="Never" size="sm" />
  return <StatusBadge status={status === 'success' ? 'online' : status} size="sm" />
}

/* ── Page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const summary = useApi(() => dashboardApi.summary())
  const signal  = useApi(() => dashboardApi.signalStats())
  const events  = useApi(() => dashboardApi.recentEvents(12))
  const sync    = useApi(() => dashboardApi.syncStatus())

  function refetchAll() {
    summary.refetch()
    signal.refetch()
    events.refetch()
    sync.refetch()
  }

  const s = summary.data
  const g = signal.data

  const onlinePct = s && s.total_onus > 0
    ? Math.round((s.online_onus / s.total_onus) * 100)
    : 0

  return (
    <div className="flex flex-col gap-8 p-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Real-time overview of your GPON network
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ONU stat cards */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          ONU Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : summary.error ? (
            <div className="col-span-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Failed to load summary: {summary.error}
            </div>
          ) : s ? (
            <>
              <StatCard label="Total ONUs"       value={s.total_onus}        sub={`${onlinePct}% online`}        icon={Smartphone}  accent="primary"     />
              <StatCard label="Online"           value={s.online_onus}       sub="Operational"                   icon={Wifi}        accent="success"     />
              <StatCard label="Offline"          value={s.offline_onus}      sub="No signal"                     icon={WifiOff}     accent="destructive" />
              <StatCard label="Unconfigured"     value={s.unconfigured_onus} sub="Awaiting authorization"        icon={Clock}       accent="warning"     />
            </>
          ) : null}
        </div>
      </section>

      {/* Middle row: Signal quality + Sync status */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Signal quality */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Signal Quality</h2>
          </div>

          {signal.loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-8 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : signal.error ? (
            <p className="text-sm text-destructive">{signal.error}</p>
          ) : g ? (
            <div className="space-y-4">
              <SignalBar
                label={`Normal (above ${g.warning_threshold_dbm} dBm)`}
                value={g.sampled_onus - g.weak_signal_onus - g.critical_signal_onus}
                total={g.sampled_onus}
                variant="success"
              />
              <SignalBar
                label={`Weak (${g.critical_threshold_dbm}–${g.warning_threshold_dbm} dBm)`}
                value={g.weak_signal_onus}
                total={g.sampled_onus}
                variant="warning"
              />
              <SignalBar
                label={`Critical (below ${g.critical_threshold_dbm} dBm)`}
                value={g.critical_signal_onus}
                total={g.sampled_onus}
                variant="destructive"
              />
              <p className="text-xs text-muted-foreground pt-1">
                {g.sampled_onus} ONUs with signal samples
              </p>
            </div>
          ) : null}
        </div>

        {/* Sync status */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Sync Status</h2>
          </div>

          {sync.loading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : sync.data ? (
            <div className="space-y-5">
              {[
                { label: 'Configured sync',   item: sync.data.configured_sync   },
                { label: 'Unconfigured sync', item: sync.data.unconfigured_sync },
              ].map(({ label, item }) => (
                <div key={label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <SyncDot status={item?.status} />
                  {item?.finished_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.finished_at).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {item.duration_ms && ` · ${item.duration_ms}ms`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No sync data available.</p>
          )}
        </div>
      </div>

      {/* Recent events */}
      <section>
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Recent Events</h2>
            </div>
            {events.data && (
              <span className="text-xs text-muted-foreground">
                Last {events.data.items.length} events
              </span>
            )}
          </div>

          <div className="px-6">
            {events.loading ? (
              Array.from({ length: 6 }).map((_, i) => <EventRowSkeleton key={i} />)
            ) : events.error ? (
              <p className="py-8 text-center text-sm text-destructive">{events.error}</p>
            ) : events.data?.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent events.</p>
            ) : (
              events.data?.items.map(event => (
                <EventRow key={event.id} event={event} />
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
