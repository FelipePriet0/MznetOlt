'use client'

import { useCallback } from 'react'
import { useApi } from '@/hooks/use-api'
import { settingsApi, type ZoneItem, type OnuTypeItem, type SpeedProfileItem } from '@/lib/api/settings'
import { Skeleton } from '@/components/shared/skeleton'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { cn }       from '@/lib/utils'
import {
  Settings, RefreshCw, MapPin, Cpu,
  Gauge, Download, Upload, AlertTriangle,
  Calendar,
} from 'lucide-react'

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({
  icon: Icon,
  title,
  count,
  children,
  loading,
  empty,
  emptyText,
}: {
  icon:      React.ElementType
  title:     string
  count?:    number
  children:  React.ReactNode
  loading:   boolean
  empty:     boolean
  emptyText: string
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {count !== undefined && (
          <Badge variant="muted" className="ml-auto text-xs">{count}</Badge>
        )}
      </div>

      {loading ? (
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="divide-y">{children}</div>
      )}
    </div>
  )
}

/* ── Zone row ─────────────────────────────────────────────────── */
function ZoneRow({ zone }: { zone: ZoneItem }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{zone.name}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Calendar className="h-3 w-3" />
        {new Date(zone.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        })}
      </div>
      <Badge variant="muted" className="font-mono text-[10px] shrink-0">#{zone.id}</Badge>
    </div>
  )
}

/* ── ONU Type row ─────────────────────────────────────────────── */
const VENDOR_DOT: Record<string, string> = {
  huawei:    'bg-red-500',
  zte:       'bg-blue-500',
  fiberhome: 'bg-green-500',
  nokia:     'bg-purple-500',
}

function OnuTypeRow({ type }: { type: OnuTypeItem }) {
  const dot = VENDOR_DOT[type.vendor.toLowerCase()] ?? 'bg-muted-foreground'
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
        <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{type.name}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={cn('h-2 w-2 rounded-full', dot)} />
        <span className="text-xs text-muted-foreground">{type.vendor}</span>
      </div>
      <Badge variant="muted" className="font-mono text-[10px] shrink-0">#{type.id}</Badge>
    </div>
  )
}

/* ── Speed Profile row ────────────────────────────────────────── */
function SpeedProfileRow({ profile }: { profile: SpeedProfileItem }) {
  const total    = profile.download_mbps + profile.upload_mbps
  const dlPct    = total > 0 ? (profile.download_mbps / total) * 100 : 50
  const isGig    = profile.download_mbps >= 1000

  function fmt(mbps: number) {
    return mbps >= 1000 ? `${mbps / 1000} Gbps` : `${mbps} Mbps`
  }

  return (
    <div className="px-5 py-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{profile.name}</p>
          {isGig && (
            <Badge variant="secondary" className="text-[10px]">Gig+</Badge>
          )}
        </div>
        <Badge variant="muted" className="font-mono text-[10px]">#{profile.id}</Badge>
      </div>

      {/* Speed bars */}
      <div className="flex items-center gap-3 pl-9">
        {/* Download */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[90px]">
          <Download className="h-3 w-3 text-primary" />
          <span className="font-mono font-medium text-foreground">{fmt(profile.download_mbps)}</span>
        </div>

        {/* Visual bar */}
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${dlPct}%` }}
          />
        </div>

        {/* Upload */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[90px] justify-end">
          <span className="font-mono font-medium text-foreground">{fmt(profile.upload_mbps)}</span>
          <Upload className="h-3 w-3 text-secondary" />
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const zonesFetcher    = useCallback(() => settingsApi.zones(),         [])
  const typesFetcher    = useCallback(() => settingsApi.onuTypes(),      [])
  const profilesFetcher = useCallback(() => settingsApi.speedProfiles(), [])

  const { data: zones,    loading: loadingZones,    refetch: refetchZones    } = useApi(zonesFetcher,    [])
  const { data: types,    loading: loadingTypes,    refetch: refetchTypes    } = useApi(typesFetcher,    [])
  const { data: profiles, loading: loadingProfiles, refetch: refetchProfiles } = useApi(profilesFetcher, [])

  function refetchAll() {
    refetchZones()
    refetchTypes()
    refetchProfiles()
  }

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Reference data — zones, ONU types, speed profiles
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh all
        </Button>
      </div>

      {/* 3-column grid on wide screens, stacked on mobile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Zones */}
        <Section
          icon={MapPin}
          title="Zones"
          count={zones?.items.length}
          loading={loadingZones}
          empty={!zones?.items.length}
          emptyText="No zones configured."
        >
          {zones?.items.map(zone => (
            <ZoneRow key={zone.id} zone={zone} />
          ))}
        </Section>

        {/* ONU Types */}
        <Section
          icon={Cpu}
          title="ONU Types"
          count={types?.items.length}
          loading={loadingTypes}
          empty={!types?.items.length}
          emptyText="No ONU types registered."
        >
          {types?.items.map(type => (
            <OnuTypeRow key={type.id} type={type} />
          ))}
        </Section>

        {/* Speed Profiles */}
        <Section
          icon={Gauge}
          title="Speed Profiles"
          count={profiles?.items.length}
          loading={loadingProfiles}
          empty={!profiles?.items.length}
          emptyText="No speed profiles configured."
        >
          {profiles?.items.map(profile => (
            <SpeedProfileRow key={profile.id} profile={profile} />
          ))}
        </Section>

      </div>

      {/* Summary row */}
      {(zones || types || profiles) && !loadingZones && !loadingTypes && !loadingProfiles && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Zones',          value: zones?.items.length    ?? 0, color: 'text-blue-500'   },
            { label: 'ONU Types',      value: types?.items.length    ?? 0, color: 'text-purple-500' },
            { label: 'Speed Profiles', value: profiles?.items.length ?? 0, color: 'text-cyan-500'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card px-5 py-4 text-center">
              <p className={cn('text-3xl font-bold tabular-nums', color)}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
