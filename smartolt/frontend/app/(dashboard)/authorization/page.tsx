'use client'

import { useState, useCallback } from 'react'
import { useApi } from '@/hooks/use-api'
import {
  authorizationApi,
  type AuthorizationPreset,
  type AuthorizeOnuInput,
} from '@/lib/api/authorization'
import { Skeleton } from '@/components/shared/skeleton'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Badge }    from '@/components/ui/badge'
import { cn }       from '@/lib/utils'
import {
  ShieldCheck, RefreshCw, Star, CheckCircle2,
  XCircle, Zap, AlertTriangle, Search, X,
} from 'lucide-react'

/* ── Preset card ──────────────────────────────────────────────── */
function PresetCard({
  preset,
  selected,
  onSelect,
}: {
  preset:   AuthorizationPreset
  selected: boolean
  onSelect: (preset: AuthorizationPreset) => void
}) {
  return (
    <button
      onClick={() => onSelect(preset)}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-all duration-150',
        'hover:border-primary/50 hover:bg-primary/5',
        selected
          ? 'border-primary bg-primary/10 ring-1 ring-primary'
          : 'border-border bg-card',
        !preset.is_active && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold">{preset.name}</p>
              {preset.is_default && (
                <Star className="h-3 w-3 fill-warning text-warning" />
              )}
            </div>
            {preset.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {preset.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={preset.is_active ? 'success' : 'muted'} className="text-[10px]">
            {preset.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {preset.is_default && (
            <Badge variant="warning" className="text-[10px]">Default</Badge>
          )}
        </div>
      </div>

      {selected && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Selected preset
        </div>
      )}
    </button>
  )
}

/* ── Authorize ONU panel ─────────────────────────────────────── */
function AuthorizePanel({
  selectedPreset,
  onSuccess,
}: {
  selectedPreset: AuthorizationPreset | null
  onSuccess: () => void
}) {
  const [onuId, setOnuId]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]       = useState<{ success: boolean; event_id: number | null } | null>(null)
  const [error, setError]         = useState<string | null>(null)

  async function handleAuthorize(e: React.FormEvent) {
    e.preventDefault()
    const id = Number(onuId.trim())
    if (!id || isNaN(id)) {
      setError('Please enter a valid ONU ID.')
      return
    }

    setSubmitting(true)
    setResult(null)
    setError(null)

    const payload: AuthorizeOnuInput = {
      onu_id:    id,
      preset_id: selectedPreset?.id,
    }

    try {
      const res = await authorizationApi.authorize(payload)
      setResult(res)
      if (res.success) {
        setOnuId('')
        onSuccess()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authorization failed.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setOnuId('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="rounded-xl border bg-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Zap className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Authorize ONU</h3>
          <p className="text-xs text-muted-foreground">
            {selectedPreset
              ? `Using preset: ${selectedPreset.name}`
              : 'Will use the default preset'}
          </p>
        </div>
      </div>

      <form onSubmit={handleAuthorize} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="onu-id">ONU ID <span className="text-destructive">*</span></Label>
          <Input
            id="onu-id"
            type="number"
            placeholder="e.g. 42"
            value={onuId}
            onChange={e => { setOnuId(e.target.value); setError(null); setResult(null) }}
            className="font-mono"
            min={1}
          />
          <p className="text-xs text-muted-foreground">
            Enter the numeric ID of the unconfigured ONU.
          </p>
        </div>

        {/* Selected preset info */}
        {selectedPreset && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium text-primary">
              Preset: {selectedPreset.name}
            </span>
            {selectedPreset.is_default && (
              <Star className="h-3 w-3 fill-warning text-warning ml-auto" />
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 animate-fade-in">
            <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            'flex items-start gap-2 rounded-lg border px-3 py-2 animate-fade-in',
            result.success
              ? 'bg-success/10 border-success/20'
              : 'bg-destructive/10 border-destructive/20'
          )}>
            {result.success
              ? <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              : <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            }
            <div className="text-xs">
              <p className={cn('font-semibold', result.success ? 'text-success' : 'text-destructive')}>
                {result.success ? 'Authorization successful!' : 'Authorization failed'}
              </p>
              {result.event_id && (
                <p className="text-muted-foreground mt-0.5">Event ID: {result.event_id}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" loading={submitting} disabled={!onuId}>
            <Zap className="h-3.5 w-3.5" />
            Authorize
          </Button>
          {(result || error) && (
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function AuthorizationPage() {
  const [selectedPreset, setSelectedPreset] = useState<AuthorizationPreset | null>(null)
  const [search, setSearch]                 = useState('')
  const [searchInput, setSearchInput]       = useState('')

  const presetsFetcher = useCallback(
    () => authorizationApi.listPresets({ search: search || undefined, page_size: 50 }),
    [search]
  )
  const { data, loading, refetch } = useApi(presetsFetcher, [search])

  const defaultPreset = data?.items.find(p => p.is_default) ?? null

  function applySearch() {
    setSearch(searchInput)
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
  }

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Authorization</h1>
            <p className="text-sm text-muted-foreground">
              Select a preset and authorize unconfigured ONUs
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Default preset banner */}
      {defaultPreset && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
          <Star className="h-4 w-4 fill-warning text-warning shrink-0" />
          <p className="text-sm">
            <span className="font-medium">Default preset:</span>{' '}
            <span className="text-muted-foreground">{defaultPreset.name}</span>
            {defaultPreset.description && (
              <span className="text-muted-foreground"> — {defaultPreset.description}</span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left: Preset list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Presets {data && `(${data.total})`}
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search presets…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applySearch()}
                  className="pl-8 h-8 text-sm w-48"
                />
              </div>
              {search && (
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 py-12 text-muted-foreground">
              <AlertTriangle className="h-6 w-6" />
              <p className="text-sm">No authorization presets found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.items.map(preset => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  selected={selectedPreset?.id === preset.id}
                  onSelect={p => setSelectedPreset(prev => prev?.id === p.id ? null : p)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Authorize panel */}
        <div className="space-y-4">
          <AuthorizePanel
            selectedPreset={selectedPreset}
            onSuccess={refetch}
          />

          {/* Instructions */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              How it works
            </p>
            <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
              <li>Select a preset from the list (optional)</li>
              <li>Enter the ONU ID to authorize</li>
              <li>Click Authorize — the system will apply the preset config</li>
              <li>If no preset is selected, the default preset is used</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
