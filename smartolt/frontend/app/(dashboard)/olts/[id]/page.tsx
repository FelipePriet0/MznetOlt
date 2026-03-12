'use client'

import { use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { oltApi } from '@/lib/api/olt'
import { Skeleton } from '@/components/shared/skeleton'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { cn }       from '@/lib/utils'
import {
  ArrowLeft, Server, MapPin, Globe,
  Cpu, MemoryStick, Thermometer, Wind,
  Calendar, RefreshCw, AlertTriangle,
} from 'lucide-react'

/* ── Metric card ──────────────────────────────────────────────── */
function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  bar,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  unit?: string
  color: 'blue' | 'purple' | 'amber' | 'cyan'
  bar?: number // 0-100
}) {
  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-500',   fill: 'bg-blue-500'   },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', fill: 'bg-purple-500' },
    amber:  { bg: 'bg-amber-500/10',  icon: 'text-amber-500',  fill: 'bg-amber-500'  },
    cyan:   { bg: 'bg-cyan-500/10',   icon: 'text-cyan-500',   fill: 'bg-cyan-500'   },
  }
  const c = colorMap[color]

  const barColor =
    typeof bar === 'number'
      ? bar > 85 ? 'bg-destructive' : bar > 70 ? 'bg-warning' : c.fill
      : c.fill

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', c.bg)}>
          <Icon className={cn('h-4.5 w-4.5', c.icon)} />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold tabular-nums">{value}</span>
          {unit && <span className="mb-1 text-sm text-muted-foreground">{unit}</span>}
        </div>

        {typeof bar === 'number' && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', barColor)}
              style={{ width: `${Math.min(bar, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Info row ─────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-8 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40 col-span-1" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function OltDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const oltId  = Number(id)
  const router = useRouter()

  const detailFetcher = useCallback(() => oltApi.detail(oltId), [oltId])
  const healthFetcher = useCallback(() => oltApi.health(oltId),  [oltId])

  const { data: olt,    loading: loadingOlt,    refetch: refetchDetail } = useApi(detailFetcher, [oltId])
  const { data: health, loading: loadingHealth, refetch: refetchHealth  } = useApi(healthFetcher, [oltId])

  function refetchAll() {
    refetchDetail()
    refetchHealth()
  }

  if (loadingOlt) return <PageSkeleton />

  if (!olt) return (
    <div className="flex flex-col items-center justify-center gap-4 p-16 text-muted-foreground">
      <AlertTriangle className="h-10 w-10" />
      <p className="text-lg font-medium">OLT not found</p>
      <Button variant="outline" onClick={() => router.back()}>Go back</Button>
    </div>
  )

  const h = health?.item ?? null

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{olt.name}</h1>
              <p className="font-mono text-sm text-muted-foreground">{olt.mgmt_ip}</p>
            </div>
          </div>
          <Badge variant="outline" className="ml-2 uppercase text-xs tracking-wide">
            {olt.vendor}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left: Device info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Identity card */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Device Information
            </h2>
            <div className="mt-4 divide-y divide-border">
              <InfoRow icon={Server}   label="Name"        value={olt.name} />
              <InfoRow icon={Globe}    label="Mgmt IP"     value={
                <span className="font-mono">{olt.mgmt_ip}</span>
              } />
              <InfoRow icon={Server}   label="Vendor"      value={
                <Badge variant="outline" className="uppercase text-xs">{olt.vendor}</Badge>
              } />
              <InfoRow icon={MapPin}   label="Location"    value={olt.location_name ?? '—'} />
              <InfoRow icon={MapPin}   label="Zone"        value={olt.zone_name ?? '—'} />
              <InfoRow icon={Calendar} label="Registered"  value={
                new Date(olt.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })
              } />
              <InfoRow icon={Calendar} label="Last update" value={
                new Date(olt.updated_at).toLocaleString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              } />
            </div>
          </div>

          {/* Health metrics */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Health Metrics
              </h2>
              {h && (
                <span className="text-xs text-muted-foreground">
                  Collected {new Date(h.collected_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {loadingHealth ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : !h ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 py-10 text-muted-foreground">
                <AlertTriangle className="h-6 w-6" />
                <p className="text-sm">No health data available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MetricCard
                  icon={Cpu}
                  label="CPU"
                  value={h.cpu_usage}
                  unit="%"
                  color="blue"
                  bar={h.cpu_usage}
                />
                <MetricCard
                  icon={MemoryStick}
                  label="Memory"
                  value={h.memory_usage}
                  unit="%"
                  color="purple"
                  bar={h.memory_usage}
                />
                <MetricCard
                  icon={Thermometer}
                  label="Temp"
                  value={h.temperature}
                  unit="°C"
                  color="amber"
                  bar={h.temperature > 80 ? 100 : (h.temperature / 80) * 100}
                />
                <MetricCard
                  icon={Wind}
                  label="Fan"
                  value={h.fan_status}
                  color="cyan"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Status sidebar */}
        <div className="space-y-4">

          {/* Overall status */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              System Status
            </h3>
            {!h ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                No data
              </div>
            ) : (
              <div className="space-y-3">
                {/* CPU status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CPU</span>
                  <Badge variant={
                    h.cpu_usage > 85 ? 'destructive' :
                    h.cpu_usage > 70 ? 'warning' : 'success'
                  }>
                    {h.cpu_usage > 85 ? 'Critical' : h.cpu_usage > 70 ? 'High' : 'Normal'}
                  </Badge>
                </div>
                {/* Memory status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Memory</span>
                  <Badge variant={
                    h.memory_usage > 85 ? 'destructive' :
                    h.memory_usage > 70 ? 'warning' : 'success'
                  }>
                    {h.memory_usage > 85 ? 'Critical' : h.memory_usage > 70 ? 'High' : 'Normal'}
                  </Badge>
                </div>
                {/* Temp status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Temperature</span>
                  <Badge variant={
                    h.temperature > 75 ? 'destructive' :
                    h.temperature > 60 ? 'warning' : 'success'
                  }>
                    {h.temperature > 75 ? 'Hot' : h.temperature > 60 ? 'Warm' : 'Normal'}
                  </Badge>
                </div>
                {/* Fan status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fan</span>
                  <Badge variant={
                    h.fan_status === 'normal' ? 'success' :
                    h.fan_status === 'warning' ? 'warning' : 'destructive'
                  }>
                    {h.fan_status}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Timestamps
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Created at</p>
                <p className="font-medium">
                  {new Date(olt.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="font-medium">
                  {new Date(olt.updated_at).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {h && (
                <div>
                  <p className="text-xs text-muted-foreground">Health collected</p>
                  <p className="font-medium">
                    {new Date(h.collected_at).toLocaleString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
