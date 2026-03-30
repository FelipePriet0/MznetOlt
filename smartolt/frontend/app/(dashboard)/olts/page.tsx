'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import {
  oltApi,
  type OltItem,
  type OltListFilters,
} from '@/lib/api/olt'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Badge }  from '@/components/ui/badge'
import { cn }     from '@/lib/utils'
import {
  Network, Plus,
  EyeOff, Trash2,
} from 'lucide-react'

/* ── Columns ─────────────────────────────────────────────────── */
function buildColumns(
  onDeactivate: (row: OltItem) => void,
  onDelete:     (row: OltItem) => void,
): Column<OltItem>[] {
  return [
    {
      key:    'id',
      header: 'ID',
      cell:   row => <span className="font-mono text-xs text-muted-foreground">#{row.id}</span>,
    },
    {
      key:    'name',
      header: 'Nome',
      cell:   row => <span className="text-sm font-semibold">{row.name}</span>,
    },
    {
      key:    'mgmt_ip',
      header: 'IP OLT',
      cell:   row => <span className="font-mono text-xs">{row.mgmt_ip}</span>,
    },
    {
      key:    'vendor',
      header: 'Fabricante',
      cell:   row => (
        <Badge variant="outline" className="uppercase text-[10px] tracking-wide font-semibold">
          {row.vendor}
        </Badge>
      ),
    },
    {
      key:    'zone',
      header: 'Zona',
      cell:   row => row.zone_name
        ? <Badge variant="muted">{row.zone_name}</Badge>
        : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key:    'actions',
      header: 'Ação',
      cell:   row => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            title="Desativar"
            onClick={() => onDeactivate(row)}
            className="rounded p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            <EyeOff className="h-4 w-4" />
          </button>
          <button
            title="Excluir"
            onClick={() => onDelete(row)}
            className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function OltsPage() {
  const router = useRouter()

  const [filters, setFilters] = useState<OltListFilters>({ page: 1, page_size: 50 })

  const fetcher = useCallback(() => oltApi.list(filters), [filters])
  const { data, loading, refetch } = useApi(fetcher, [filters])

  async function handleDelete(row: OltItem) {
    if (!window.confirm(`Excluir a OLT "${row.name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await oltApi.delete(row.id)
      refetch()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir OLT.')
    }
  }

  function handleDeactivate(row: OltItem) {
    alert(`Desativar: ${row.name} (em breve)`)
  }

  const columns = buildColumns(handleDeactivate, handleDelete)

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
                {data ? `${data.total} equipamento${data.total !== 1 ? 's' : ''} cadastrado${data.total !== 1 ? 's' : ''}` : 'Carregando…'}
              </p>
            </div>
          </div>

          <Button onClick={() => router.push('/olts/adicionar')}>
            <Plus className="h-4 w-4" />
            Nova OLT
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={loading}
          skeletonRows={8}
          emptyText="Nenhuma OLT cadastrada."
          page={filters.page ?? 1}
          pageSize={filters.page_size ?? 50}
          total={data?.total}
          onPageChange={page => setFilters(f => ({ ...f, page }))}
          onRowClick={row => router.push(`/olts/${row.id}`)}
        />
      </div>

    </>
  )
}
