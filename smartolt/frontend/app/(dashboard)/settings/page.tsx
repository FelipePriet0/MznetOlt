export const dynamic = 'force-dynamic'

'use client'

import { useCallback, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { settingsApi, type ZoneItem } from '@/lib/api/settings'
import { Skeleton } from '@/components/shared/skeleton'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Badge }    from '@/components/ui/badge'
import { cn }       from '@/lib/utils'
import { Settings, MapPin, AlertTriangle, Plus, Trash2, X, Edit3 } from 'lucide-react'

/* ── Zone row ─────────────────────────────────────────────────── */
function ZoneRow({ zone, onDelete, onEdit }: { zone: ZoneItem; onDelete: () => void; onEdit: (zone: ZoneItem) => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <button
        type="button"
        onClick={() => onEdit(zone)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-muted/50 rounded-md px-2 py-1 transition-colors"
        title="Editar zona"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{zone.name}</p>
        </div>
      </button>
      <Badge variant="muted" className="font-mono text-[10px] shrink-0">#{zone.id}</Badge>
      <button
        type="button"
        onClick={onDelete}
        className="ml-2 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Excluir zona"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

/* ── Add Zone Modal ─────────────────────────────────────────────── */
function AddZoneModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true); setError(null)
    try {
      await settingsApi.createZone(name.trim())
      onSuccess(); onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar zona.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border bg-card shadow-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold">Nova Zona</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nome <span className="text-destructive">*</span></label>
            <Input
              placeholder="Ex: Zona Norte"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Criando…' : 'Criar zona'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [showAddZone, setShowAddZone] = useState(false)
  const [editingZone, setEditingZone] = useState<ZoneItem | null>(null)

  const zonesFetcher = useCallback(() => settingsApi.zones(), [])
  const { data: zones, loading: loadingZones, refetch: refetchZones } = useApi(zonesFetcher, [])

  async function handleDeleteZone(id: number, name: string) {
    if (!window.confirm(`Excluir a zona "${name}"? Esta ação não pode ser desfeita.`)) return
    try { await settingsApi.deleteZone(id); refetchZones() }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erro ao excluir zona.') }
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-8">

        {/* Header */
        }
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Zones</h1>
              <p className="text-sm text-muted-foreground">Gerencie suas zonas</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowAddZone(true)}>
            <Plus className="h-3.5 w-3.5" /> Nova zona
          </Button>
        </div>

        {/* Summary */}
        {zones && !loadingZones && (
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-xl border bg-card px-5 py-4 text-center">
              <p className={cn('text-3xl font-bold tabular-nums', 'text-blue-500')}>{zones.items.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Zonas cadastradas</p>
            </div>
          </div>
        )}

        {/* Zones section */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold">Zonas</h2>
            {zones && (
              <Badge variant="muted" className="ml-auto text-xs">{zones.items.length}</Badge>
            )}
          </div>

          {loadingZones ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4">
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : !zones?.items.length ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">Nenhuma zona configurada.</p>
              <Button size="sm" variant="outline" onClick={() => setShowAddZone(true)}>
                <Plus className="h-3.5 w-3.5" /> Criar primeira zona
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {zones.items.map(zone => (
                <ZoneRow
                  key={zone.id}
                  zone={zone}
                  onDelete={() => handleDeleteZone(zone.id, zone.name)}
                  onEdit={setEditingZone}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {showAddZone && (
        <AddZoneModal
          onClose={() => setShowAddZone(false)}
          onSuccess={refetchZones}
        />
      )}

      {editingZone && (
        <EditZoneModal
          zone={editingZone}
          onClose={() => setEditingZone(null)}
          onSuccess={() => { setEditingZone(null); refetchZones() }}
        />
      )}
    </>
  )
}

/* ── Edit Zone Modal ───────────────────────────────────────────── */
function EditZoneModal({ zone, onClose, onSuccess }: { zone: ZoneItem; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(zone.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true); setError(null)
    try {
      await settingsApi.updateZone(zone.id, name.trim())
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar zona.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border bg-card shadow-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Edit3 className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold">Editar Zona</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nome <span className="text-destructive">*</span></label>
            <Input
              placeholder="Ex: Zona Norte"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
