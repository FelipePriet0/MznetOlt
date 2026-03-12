'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { onuApi } from '@/lib/api/onu'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton }    from '@/components/shared/skeleton'
import { Badge }       from '@/components/ui/badge'
import { Button }      from '@/components/ui/button'
import { cn }          from '@/lib/utils'
import {
  ArrowLeft, Smartphone, Wifi, MapPin,
  Signal, Clock, Calendar, Settings,
  AlertTriangle, CheckCircle2, RefreshCw,
} from 'lucide-react'

/* ── Detail row ─────────────────────────────────────────────── */
function DetailRow({ label, value, mono = false }: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 w-40">{label}</span>
      <span className={cn(
        'text-sm text-right',
        mono && 'font-mono tracking-wide'
      )}>
        {value}
      </span>
    </div>
  )
}

/* ── Section card ───────────────────────────────────────────── */
function Section({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-6">{children}</div>
    </div>
  )
}

/* ── Signal indicator ───────────────────────────────────────── */
function SignalIndicator({ dbm }: { dbm: number | null }) {
  if (dbm === null) return (
    <span className="text-sm text-muted-foreground">No signal data</span>
  )

  const level   = dbm < -27 ? 'critical' : dbm < -24 ? 'warning' : 'good'
  const pct     = Math.max(0, Math.min(100, ((dbm + 35) / 20) * 100))
  const barColor = level === 'critical' ? 'bg-destructive' : level === 'warning' ? 'bg-warning' : 'bg-success'
  const textColor = level === 'critical' ? 'text-destructive' : level === 'warning' ? 'text-warning' : 'text-success'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn('text-2xl font-bold font-mono tabular-nums', textColor)}>
          {dbm} dBm
        </span>
        <Badge variant={level === 'good' ? 'success' : level === 'warning' ? 'warning' : 'destructive'}>
          {level === 'good' ? 'Good' : level === 'warning' ? 'Weak' : 'Critical'}
        </Badge>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Optimal range: −20 to −24 dBm
      </p>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────── */
export default function OnuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const router  = useRouter()
  const { data: onu, loading, error, refetch } = useApi(
    () => onuApi.detail(Number(id)),
    [id]
  )

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : onu ? (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono tracking-wide">
                {onu.serial_number}
              </h1>
              <StatusBadge status={onu.status} pulse={onu.status === 'online'} />
              <Badge variant={onu.admin_state === 'enabled' ? 'success' : 'muted'}>
                {onu.admin_state}
              </Badge>
            </div>
          ) : null}
          {onu && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {onu.onu_vendor ? `${onu.onu_vendor} ${onu.onu_model ?? ''}` : 'Unknown model'}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Content grid */}
      {(loading || onu) && (
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left column: main info */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Signal */}
            <Section title="Signal Quality" icon={Signal}>
              <div className="py-5">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ) : onu ? (
                  <SignalIndicator dbm={onu.last_known_signal} />
                ) : null}
              </div>
            </Section>

            {/* Network position */}
            <Section title="Network Position" icon={MapPin}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-3 border-b last:border-0">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              ) : onu ? (
                <>
                  <DetailRow label="OLT"       value={onu.olt_name} />
                  <DetailRow label="Board"      value={`${onu.board_name} (slot ${onu.board_slot_index})`} />
                  <DetailRow label="PON Port"   value={`${onu.pon_port_name} (PON ${onu.pon_index})`} />
                  <DetailRow label="OLT ID"     value={`#${onu.olt_id}`} mono />
                </>
              ) : null}
            </Section>

            {/* Device info */}
            <Section title="Device Information" icon={Smartphone}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-3 border-b last:border-0">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              ) : onu ? (
                <>
                  <DetailRow label="Serial Number" value={onu.serial_number} mono />
                  <DetailRow label="Vendor"        value={onu.onu_vendor ?? '—'} />
                  <DetailRow label="Model"         value={onu.onu_model ?? '—'} />
                  <DetailRow label="ONU Type ID"   value={onu.onu_type_id ? `#${onu.onu_type_id}` : '—'} mono />
                  <DetailRow
                    label="Last Seen"
                    value={onu.last_seen_at
                      ? new Date(onu.last_seen_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'
                    }
                  />
                </>
              ) : null}
            </Section>
          </div>

          {/* Right column: quick status */}
          <div className="flex flex-col gap-6">

            {/* Status card */}
            <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Status Overview</h2>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : onu ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connection</span>
                    <StatusBadge status={onu.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Admin State</span>
                    <Badge variant={onu.admin_state === 'enabled' ? 'success' : 'muted'}>
                      {onu.admin_state}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Signal</span>
                    {onu.last_known_signal !== null ? (
                      <Badge variant={
                        onu.last_known_signal < -27 ? 'destructive' :
                        onu.last_known_signal < -24 ? 'warning' : 'success'
                      }>
                        {onu.last_known_signal} dBm
                      </Badge>
                    ) : (
                      <Badge variant="muted">No data</Badge>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Timestamps */}
            <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Timestamps</h2>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : onu ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Created</p>
                    <p className="font-medium">
                      {new Date(onu.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Last updated</p>
                    <p className="font-medium">
                      {new Date(onu.updated_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
