export const dynamic = 'force-dynamic'

'use client'

import { useCallback, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { oltApi, type OltBackupItem } from '@/lib/api/olt'
import { Skeleton } from '@/components/shared/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, HardDrive, AlertTriangle, Download, RotateCcw, Trash2, Play, Power } from 'lucide-react'

function formatSize(kb: number | null) {
  if (!kb) return '—'
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function TypeBadge({ type }: { type: string }) {
  const isAuto = type === 'automático'
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
      isAuto
        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
        : 'bg-muted text-muted-foreground border border-border'
    )}>
      {isAuto ? 'Automático' : 'Manual'}
    </span>
  )
}

export default function OltBackupsPage() {
  const params = useParams<{ id: string }>()
  const oltId  = Number(params.id)
  const router = useRouter()

  const [triggering,      setTriggering]      = useState(false)
  const [deletingId,      setDeletingId]      = useState<number | null>(null)
  const [togglingAuto,    setTogglingAuto]    = useState(false)

  const detailFetcher = useCallback(() => oltApi.detail(oltId), [oltId])
  const fetcher       = useCallback(() => oltApi.backups(oltId), [oltId])

  const { data: olt, refetch: refetchOlt } = useApi(detailFetcher, [oltId])
  const { data, loading, refetch }         = useApi(fetcher, [oltId])

  const autoBackupOn = olt?.auto_backup_enabled ?? false

  async function handleToggleAutoBackup() {
    if (!olt) return
    setTogglingAuto(true)
    try {
      await oltApi.update(oltId, { auto_backup_enabled: !olt.auto_backup_enabled } as Parameters<typeof oltApi.update>[1])
      refetchOlt()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar backup automático.')
    } finally {
      setTogglingAuto(false)
    }
  }

  async function handleTrigger() {
    setTriggering(true)
    try {
      await oltApi.triggerBackup(oltId)
      refetch()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao iniciar backup.')
    } finally {
      setTriggering(false)
    }
  }

  async function handleDelete(backupId: number) {
    if (!window.confirm('Excluir este backup permanentemente?')) return
    setDeletingId(backupId)
    try {
      await oltApi.deleteBackup(oltId, backupId)
      refetch()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir backup.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <HardDrive className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Backups</h1>
          <p className="text-sm text-muted-foreground">{olt?.name ?? '—'}</p>
        </div>
      </div>

      {/* Card — Configurações de backup automático */}
      <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Configurações de backup automático</p>
          <button
            onClick={handleToggleAutoBackup}
            disabled={togglingAuto || !olt}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
              autoBackupOn
                ? 'bg-green-500/10 text-green-700 border border-green-500/30 hover:bg-green-500/20'
                : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
            )}
          >
            <Power className="h-3 w-3" />
            {togglingAuto ? 'Salvando…' : autoBackupOn ? 'Habilitado' : 'Desabilitado'}
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Cópia de segurança automática diária (03:00 – 04:00)
        </p>
        <p className="text-xs text-muted-foreground">
          Quando ativada, as cópias de segurança serão criadas automaticamente todos os dias entre as 03:00 e as 04:00 da manhã.
        </p>
      </div>

      {/* Table */}
      <div className="relative w-full overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-transparent">
            <tr className="hover:bg-transparent text-xs text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">Data de backup</th>
              <th className="px-4 py-2.5 text-left font-medium">Linhas de backup</th>
              <th className="px-4 py-2.5 text-left font-medium">Tamanho do backup</th>
              <th className="px-4 py-2.5 text-left font-medium">Tipo de backup</th>
              <th className="px-4 py-2.5 text-left font-medium w-52">Ações</th>
            </tr>
          </thead>
          <tbody className="table-row h-2" aria-hidden="true"></tbody>
          <tbody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="odd:bg-muted/50 odd:hover:bg-muted/50 border-none hover:bg-transparent">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-2.5"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : !data?.items.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-6 w-6" />
                    <p className="text-sm">Nenhum backup encontrado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.items.map((item: OltBackupItem) => (
                <tr key={item.id} className="odd:bg-muted/50 odd:hover:bg-muted/50 border-none hover:bg-transparent">
                  <td className="px-4 py-2.5 tabular-nums">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                    {item.line_count != null ? item.line_count.toLocaleString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatSize(item.size_kb)}</td>
                  <td className="px-4 py-2.5"><TypeBadge type={item.backup_type} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert('Download — em breve')}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                      <button
                        onClick={() => alert('Restaurar — em breve')}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" /> Restaurar Backup
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        {deletingId === item.id ? '…' : 'Del'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tbody className="table-row h-2" aria-hidden="true"></tbody>
        </table>

        {data && data.total > 0 && (
          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            {data.total} backup{data.total !== 1 ? 's' : ''} no total
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Importar configuração backup OLT/ONU
        </p>
        <Button size="sm" onClick={handleTrigger} disabled={triggering}>
          <Play className="h-3.5 w-3.5" />
          {triggering ? 'Iniciando…' : 'Faça backup de configuração agora'}
        </Button>
      </div>

    </div>
  )
}
