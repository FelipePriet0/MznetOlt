'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { onuApi, type OnuItem, type OnuListFilters } from '@/lib/api/onu'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Badge }   from '@/components/ui/badge'
import { cn }      from '@/lib/utils'
import { Search, SlidersHorizontal, Smartphone, Signal, X, Wifi, WifiOff, PlugZap, Ban } from 'lucide-react'

function SignalChip({ dbm }: { dbm: number | null }) {
  if (dbm === null) return <span className="text-xs text-muted-foreground">—</span>
  const variant = dbm < -27 ? 'destructive' : dbm < -24 ? 'warning' : 'success'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-mono font-medium',
      variant === 'destructive' && 'text-destructive',
      variant === 'warning'     && 'text-warning',
      variant === 'success'     && 'text-success',
    )}>
      <Signal className="h-3 w-3" />
      {dbm} dBm
    </span>
  )
}

const STATUS_OPTIONS = [
  { value: '',             label: 'All statuses' },
  { value: 'online',       label: 'Online'       },
  { value: 'offline',      label: 'Offline'      },
  { value: 'unconfigured', label: 'Unconfigured' },
  { value: 'configured',   label: 'Configured'   },
]

const columns: Column<OnuItem>[] = [
  {
    key: 'serial', header: 'Serial Number',
    cell: row => <span className="font-mono text-sm font-medium tracking-wide">{row.serial_number}</span>,
  },
  { key: 'status', header: 'Status', cell: row => <StatusBadge status={row.status} pulse={row.status === 'online'} /> },
  {
    key: 'location', header: 'Location',
    cell: row => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{row.olt_name}</p>
        <p className="text-xs text-muted-foreground">{row.board_name} · {row.pon_port_name}</p>
      </div>
    ),
  },
  {
    key: 'model', header: 'Model',
    cell: row => row.onu_vendor ? (
      <div className="space-y-0.5">
        <p className="text-sm">{row.onu_vendor}</p>
        <p className="text-xs text-muted-foreground">{row.onu_model ?? '—'}</p>
      </div>
    ) : <span className="text-xs text-muted-foreground">Unknown</span>,
  },
  { key: 'signal', header: 'Last Signal', cell: row => <SignalChip dbm={row.last_known_signal} /> },
  { key: 'admin', header: 'Admin State', cell: row => <Badge variant={row.admin_state === 'enabled' ? 'success' : 'muted'}>{row.admin_state}</Badge> },
  {
    key: 'seen', header: 'Last Seen',
    cell: row => row.last_seen_at ? (
      <span className="text-xs text-muted-foreground">
        {new Date(row.last_seen_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    ) : <span className="text-xs text-muted-foreground">—</span>,
  },
]

type StatusIconKey = 'online' | 'power_fail' | 'loss_signal' | 'offline' | 'admin_disabled'

export function OnuList({ fixedStatus }: { fixedStatus?: 'unconfigured' | 'configured' }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<OnuListFilters>({ page: 1, page_size: 50, status: fixedStatus })
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetcher = useCallback(() => onuApi.list(filters), [filters])
  const { data, loading, refetch } = useApi(fetcher, [filters])
  const [statusIcon, setStatusIcon] = useState<StatusIconKey | null>(null)

  useEffect(() => {
    const qpSerial = searchParams.get('serial_number') || undefined
    const qpOlt = searchParams.get('olt_id')
    const qpStatus = searchParams.get('status') || undefined

    if (fixedStatus === 'configured') {
      // Allow preselecting a status icon via query (e.g., offline)
      if (qpStatus === 'online' || qpStatus === 'offline') {
        setStatusIcon(qpStatus as StatusIconKey)
        setFilters(f => ({ ...f, status: qpStatus, admin_state: undefined, page: 1 }))
      } else if (qpStatus === 'admin_disabled') {
        setStatusIcon('admin_disabled')
        setFilters(f => ({ ...f, status: undefined, admin_state: 'disabled', page: 1 }))
      }
    } else if (!fixedStatus) {
      setFilters(f => ({
        ...f,
        status: qpStatus || f.status,
        serial_number: qpSerial || f.serial_number,
        olt_id: qpOlt ? Number(qpOlt) : f.olt_id,
        page: 1,
      }))
    }

    if (qpSerial) setSearchInput(qpSerial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applySearch() {
    setFilters(f => ({ ...f, serial_number: searchInput || undefined, page: 1 }))
  }
  function clearFilters() {
    setSearchInput('')
    setFilters({ page: 1, page_size: 50, status: fixedStatus })
    setStatusIcon(null)
  }

  const activeFilterCount = useMemo(() => [
    fixedStatus ? null : filters.status,
    filters.serial_number,
    filters.olt_id,
  ].filter(Boolean).length, [filters, fixedStatus])

  const showStatusToolbar = fixedStatus !== 'unconfigured'

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{fixedStatus ? (fixedStatus === 'unconfigured' ? 'ONUs — Não configuradas' : 'ONUs — Configuradas') : 'ONUs'}</h1>
            <p className="text-sm text-muted-foreground">{data ? `${data.total} devices found` : 'Loading…'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by serial number…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={applySearch} size="default">Search</Button>
          {!fixedStatus && (
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowFilters(v => !v)}
              className={cn(activeFilterCount > 0 && 'border-primary text-primary')}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          )}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="default" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Icon-based Status Filter Toolbar */}
        {showStatusToolbar && (
          <div className="flex items-center gap-2">
            {([
              { key: 'online',        icon: <Wifi className="h-4 w-4" />,          title: 'Online' },
              { key: 'power_fail',    icon: <PlugZap className="h-4 w-4" />,       title: 'Power fail' },
              { key: 'loss_signal',   icon: <Signal className="h-4 w-4" />,        title: 'Loss of signal' },
              { key: 'offline',       icon: <WifiOff className="h-4 w-4" />,       title: 'Offline' },
              { key: 'admin_disabled',icon: <Ban className="h-4 w-4" />,           title: 'Admin disabled' },
            ] as { key: StatusIconKey; icon: React.ReactNode; title: string }[]).map(btn => {
              const pressed = statusIcon === btn.key
              return (
                <button
                  key={btn.key}
                  type="button"
                  title={btn.title}
                  aria-pressed={pressed}
                  onClick={() => {
                    setStatusIcon(prev => {
                      const next = prev === btn.key ? null : btn.key
                      setFilters(f => {
                        const base = { ...f, page: 1 }
                        if (next === null) {
                          // Reset to base scope (configured list keeps configured)
                          if (fixedStatus === 'configured') return { ...base, status: 'configured', admin_state: undefined }
                          return { ...base, status: undefined, admin_state: undefined }
                        }
                        switch (next) {
                          case 'online':         return { ...base, status: 'online', admin_state: undefined }
                          case 'offline':        return { ...base, status: 'offline', admin_state: undefined }
                          case 'admin_disabled': return { ...base, admin_state: 'disabled', status: undefined }
                          case 'power_fail':     return { ...base, status: 'offline', admin_state: undefined }
                          case 'loss_signal':    return { ...base, status: 'offline', admin_state: undefined }
                        }
                      })
                      return next
                    })
                  }}
                  className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-md border bg-background transition-colors',
                    pressed ? 'bg-muted border-primary text-primary' : 'hover:bg-muted'
                  )}
                >
                  {btn.icon}
                </button>
              )
            })}
          </div>
        )}

        {showFilters && !fixedStatus && (
          <div className="flex flex-wrap gap-3 rounded-xl border bg-muted/30 p-4 animate-fade-in">
            {/* Additional filters can go here in future */}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={loading}
        skeletonRows={10}
        emptyText="No ONUs found. Try adjusting your filters."
        page={filters.page ?? 1}
        pageSize={filters.page_size ?? 50}
        total={data?.total}
        onPageChange={page => setFilters(f => ({ ...f, page }))}
        onRowClick={row => router.push(`/onus/${row.id}`)}
      />
    </div>
  )
}
