'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import {
  oltApi,
  type OltItem,
  type OltListFilters,
  type CreateOltInput,
} from '@/lib/api/olt'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Label }     from '@/components/ui/label'
import { Badge }     from '@/components/ui/badge'
import { cn }        from '@/lib/utils'
import {
  Server, Search, RefreshCw, Plus, X,
  MapPin, Network, Calendar,
} from 'lucide-react'

/* ── Vendor badge ────────────────────────────────────────────── */
const VENDOR_COLORS: Record<string, string> = {
  huawei:   'bg-red-500/10 text-red-500 border-red-500/20',
  zte:      'bg-blue-500/10 text-blue-500 border-blue-500/20',
  fiberhome:'bg-green-500/10 text-green-500 border-green-500/20',
  nokia:    'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

function VendorBadge({ vendor }: { vendor: string }) {
  const key = vendor.toLowerCase()
  const color = VENDOR_COLORS[key] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
      color,
    )}>
      {vendor}
    </span>
  )
}

/* ── Columns ─────────────────────────────────────────────────── */
const columns: Column<OltItem>[] = [
  {
    key:    'name',
    header: 'OLT Name',
    cell:   row => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Server className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">{row.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.mgmt_ip}</p>
        </div>
      </div>
    ),
  },
  {
    key:    'vendor',
    header: 'Vendor',
    cell:   row => <VendorBadge vendor={row.vendor} />,
  },
  {
    key:    'location',
    header: 'Location',
    cell:   row => (
      <div className="flex items-center gap-1.5 text-sm">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>{row.location_name ?? <span className="text-muted-foreground">—</span>}</span>
      </div>
    ),
  },
  {
    key:    'zone',
    header: 'Zone',
    cell:   row => row.zone_name ? (
      <Badge variant="outline">{row.zone_name}</Badge>
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    ),
  },
  {
    key:    'created',
    header: 'Added',
    cell:   row => (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {new Date(row.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        })}
      </div>
    ),
  },
]

/* ── Create OLT Modal ─────────────────────────────────────────── */
function CreateOltModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<CreateOltInput>({
    name: '', vendor: '', mgmt_ip: '', location_id: 0, zone_id: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof CreateOltInput, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.vendor || !form.mgmt_ip) {
      setError('Name, vendor and management IP are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await oltApi.create(form)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create OLT.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl p-6 animate-slide-up">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New OLT</h2>
              <p className="text-sm text-muted-foreground">Register a new OLT device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="olt-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="olt-name"
              placeholder="e.g. OLT-SP-01"
              value={form.name}
              onChange={e => update('name', e.target.value)}
            />
          </div>

          {/* Vendor */}
          <div className="space-y-1.5">
            <Label htmlFor="olt-vendor">Vendor <span className="text-destructive">*</span></Label>
            <Input
              id="olt-vendor"
              placeholder="e.g. Huawei, ZTE, Nokia"
              value={form.vendor}
              onChange={e => update('vendor', e.target.value)}
            />
          </div>

          {/* Mgmt IP */}
          <div className="space-y-1.5">
            <Label htmlFor="olt-ip">
              Management IP <span className="text-destructive">*</span>
            </Label>
            <Input
              id="olt-ip"
              placeholder="192.168.1.1"
              value={form.mgmt_ip}
              onChange={e => update('mgmt_ip', e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Location + Zone (side by side) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="olt-location">Location ID</Label>
              <Input
                id="olt-location"
                type="number"
                placeholder="1"
                value={form.location_id || ''}
                onChange={e => update('location_id', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="olt-zone">Zone ID</Label>
              <Input
                id="olt-zone"
                type="number"
                placeholder="1"
                value={form.zone_id || ''}
                onChange={e => update('zone_id', Number(e.target.value))}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive animate-fade-in">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              Create OLT
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function OltsPage() {
  const router  = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [filters, setFilters]     = useState<OltListFilters>({ page: 1, page_size: 50 })
  const [searchInput, setSearch]  = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const fetcher = useCallback(() => oltApi.list(filters), [filters])
  const { data, loading, refetch } = useApi(fetcher, [filters])

  function applySearch() {
    setFilters(f => ({ ...f, search: searchInput || undefined, page: 1 }))
  }

  function clearSearch() {
    setSearch('')
    setFilters({ page: 1, page_size: 50 })
  }

  const hasSearch = !!filters.search

  return (
    <>
      <div className="flex flex-col gap-6 p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Network className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">OLTs</h1>
              <p className="text-sm text-muted-foreground">
                {data ? `${data.total} device${data.total !== 1 ? 's' : ''} registered` : 'Loading…'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="h-3.5 w-3.5" />
                New OLT
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or IP…"
              value={searchInput}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={applySearch}>Search</Button>
          {hasSearch && (
            <Button variant="ghost" onClick={clearSearch}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={loading}
          skeletonRows={8}
          emptyText="No OLTs registered yet."
          page={filters.page ?? 1}
          pageSize={filters.page_size ?? 50}
          total={data?.total}
          onPageChange={page => setFilters(f => ({ ...f, page }))}
          onRowClick={row => router.push(`/olts/${row.id}`)}
        />
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateOltModal
          onClose={() => setShowCreate(false)}
          onSuccess={refetch}
        />
      )}
    </>
  )
}
