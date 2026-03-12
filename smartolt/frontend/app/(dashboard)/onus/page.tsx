'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { onuApi, type OnuItem, type OnuListFilters } from '@/lib/api/onu'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Badge }   from '@/components/ui/badge'
import { cn }      from '@/lib/utils'
import {
  Search, SlidersHorizontal, RefreshCw,
  Smartphone, Signal, X,
} from 'lucide-react'

/* ── Signal chip ─────────────────────────────────────────────── */
function SignalChip({ dbm }: { dbm: number | null }) {
  if (dbm === null) return <span className="text-xs text-muted-foreground">—</span>

  const variant =
    dbm < -27 ? 'destructive' :
    dbm < -24 ? 'warning'     : 'success'

  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-mono font-medium',
      variant === 'destructive' && 'text-destructive',
      variant === 'warning'     && 'text-warning',
      variant === 'success'     && 'text-success',
    )}>
      <Signal className="h-3 w-3" />
      {dbm} dBm
    </span>
  )
}

/* ── Status filters ─────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: '',             label: 'All statuses' },
  { value: 'online',       label: 'Online'       },
  { value: 'offline',      label: 'Offline'      },
  { value: 'unconfigured', label: 'Unconfigured' },
  { value: 'configured',   label: 'Configured'   },
]

/* ── Columns ─────────────────────────────────────────────────── */
const columns: Column<OnuItem>[] = [
  {
    key:    'serial',
    header: 'Serial Number',
    cell:   row => (
      <span className="font-mono text-sm font-medium tracking-wide">
        {row.serial_number}
      </span>
    ),
  },
  {
    key:    'status',
    header: 'Status',
    cell:   row => <StatusBadge status={row.status} pulse={row.status === 'online'} />,
  },
  {
    key:    'location',
    header: 'Location',
    cell:   row => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{row.olt_name}</p>
        <p className="text-xs text-muted-foreground">
          {row.board_name} · {row.pon_port_name}
        </p>
      </div>
    ),
  },
  {
    key:    'model',
    header: 'Model',
    cell:   row => row.onu_vendor ? (
      <div className="space-y-0.5">
        <p className="text-sm">{row.onu_vendor}</p>
        <p className="text-xs text-muted-foreground">{row.onu_model ?? '—'}</p>
      </div>
    ) : <span className="text-xs text-muted-foreground">Unknown</span>,
  },
  {
    key:    'signal',
    header: 'Last Signal',
    cell:   row => <SignalChip dbm={row.last_known_signal} />,
  },
  {
    key:    'admin',
    header: 'Admin State',
    cell:   row => (
      <Badge variant={row.admin_state === 'enabled' ? 'success' : 'muted'}>
        {row.admin_state}
      </Badge>
    ),
  },
  {
    key:    'seen',
    header: 'Last Seen',
    cell:   row => row.last_seen_at ? (
      <span className="text-xs text-muted-foreground">
        {new Date(row.last_seen_at).toLocaleString('en-US', {
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </span>
    ) : <span className="text-xs text-muted-foreground">—</span>,
  },
]

/* ── Page ─────────────────────────────────────────────────────── */
export default function OnusPage() {
  const router = useRouter()

  const [filters, setFilters] = useState<OnuListFilters>({
    page: 1, page_size: 50,
  })
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetcher = useCallback(
    () => onuApi.list(filters),
    [filters]
  )
  const { data, loading, refetch } = useApi(fetcher, [filters])

  function applySearch() {
    setFilters(f => ({ ...f, serial_number: searchInput || undefined, page: 1 }))
  }

  function clearFilters() {
    setSearchInput('')
    setFilters({ page: 1, page_size: 50 })
  }

  const activeFilterCount = [
    filters.status,
    filters.serial_number,
    filters.olt_id,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ONUs</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} devices found` : 'Loading…'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Search + filter bar */}
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
          <Button onClick={applySearch} size="default">
            Search
          </Button>
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
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="default" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-xl border bg-muted/30 p-4 animate-fade-in">
            {/* Status filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <div className="flex gap-1.5 flex-wrap">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters(f => ({ ...f, status: opt.value || undefined, page: 1 }))}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      filters.status === opt.value || (!filters.status && !opt.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
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
        onRowClick={row => router.push(`/dashboard/onus/${row.id}`)}
      />
    </div>
  )
}
