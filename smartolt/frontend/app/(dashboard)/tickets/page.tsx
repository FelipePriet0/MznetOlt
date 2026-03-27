"use client"

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { diagnosticsApi, type TicketItem, type TicketFilters } from '@/lib/api/diagnostics'
import { oltApi, type OltItem } from '@/lib/api/olt'
import { DataTable, type Column } from '@/components/shared/data-table'
import { cn } from '@/lib/utils'
import { ChevronDown, AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react'

/* ─── Urgency badge ─────────────────────────────────────────── */
const URGENCY_LABEL: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítico',
}

const URGENCY_CLASS: Record<string, string> = {
  low:      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const URGENCY_ICON: Record<string, React.ElementType> = {
  low: Info,
  medium: AlertTriangle,
  high: AlertCircle,
  critical: Zap,
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const Icon = URGENCY_ICON[urgency] ?? Info
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', URGENCY_CLASS[urgency])}>
      <Icon className="h-3 w-3" />
      {URGENCY_LABEL[urgency] ?? urgency}
    </span>
  )
}

/* ─── Status badge ───────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  open:           'Aberto',
  in_field:       'Em campo',
  resolved:       'Resolvido',
  closed:         'Fechado',
  false_positive: 'Falso positivo',
}

const STATUS_CLASS: Record<string, string> = {
  open:           'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  in_field:       'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  resolved:       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed:         'bg-muted text-muted-foreground',
  false_positive: 'bg-muted text-muted-foreground',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STATUS_CLASS[status])}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

/* ─── Detector label ─────────────────────────────────────────── */
const DETECTOR_LABEL: Record<string, string> = {
  reactive_drop: 'Queda reativa',
  flapping:      'Instabilidade',
  rx_trend:      'Sinal caindo',
  tx_dying:      'TX degradado',
  ghost_onu:     'ONU fantasma',
}

/* ─── FilterCell ──────────────────────────────────────────────── */
function FilterCell({ label, value, open, onToggle, dropRef, children }: {
  label: string
  value: string
  open: boolean
  onToggle: () => void
  dropRef: React.RefObject<HTMLDivElement>
  children: React.ReactNode
}) {
  return (
    <div ref={dropRef} className="flex items-center gap-1.5">
      <span className="text-xs font-bold whitespace-nowrap shrink-0">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'h-8 min-w-[130px] flex items-center justify-between gap-1 rounded-md border border-input bg-background px-2.5 text-xs transition-colors hover:bg-muted',
            open && 'border-ring ring-2 ring-ring ring-offset-2 ring-offset-background',
          )}
        >
          <span>{value}</span>
          <ChevronDown className={cn('h-3 w-3 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute left-0 z-30 mt-1 min-w-[160px] rounded-md border border-input bg-popover p-1 shadow-lg">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

function Opt({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="w-full text-left px-3 py-1.5 text-xs rounded-sm hover:bg-muted" onClick={onClick}>
      {label}
    </button>
  )
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function TicketsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, page_size: 50 })

  const [statusOpen,  setStatusOpen]  = useState(false)
  const [urgencyOpen, setUrgencyOpen] = useState(false)
  const [oltOpen,     setOltOpen]     = useState(false)

  const statusRef  = useRef<HTMLDivElement>(null)
  const urgencyRef = useRef<HTMLDivElement>(null)
  const oltRef     = useRef<HTMLDivElement>(null)

  const olts = useApi(() => oltApi.list({ page_size: 1000 }), [])
  const fetcher = useCallback(() => diagnosticsApi.listTickets(filters), [filters])
  const { data, loading } = useApi(fetcher, [filters])

  const oltOptions: OltItem[] = olts.data?.items ?? []

  const statusLabel = filters.status ? (STATUS_LABEL[filters.status] ?? filters.status) : 'Qualquer'
  const urgencyLabel = filters.urgency ? (URGENCY_LABEL[filters.urgency] ?? filters.urgency) : 'Qualquer'
  const oltLabel = filters.olt_id
    ? (oltOptions.find(o => o.id === filters.olt_id)?.name ?? `OLT #${filters.olt_id}`)
    : 'Qualquer'

  const columns: Column<TicketItem>[] = [
    {
      key: 'urgency',
      header: 'Urgência',
      cell: row => <UrgencyBadge urgency={row.urgency} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: row => <StatusBadge status={row.status} />,
    },
    {
      key: 'title',
      header: 'Problema',
      cell: row => <span className="text-sm font-medium">{DETECTOR_LABEL[row.detector_type] ?? row.detector_type}</span>,
    },
    {
      key: 'onu_serial',
      header: 'ONU (serial)',
      cell: row => <span className="font-mono text-sm">{row.onu_serial}</span>,
    },
    {
      key: 'olt_name',
      header: 'OLT',
      cell: row => <span className="text-sm">{row.olt_name}</span>,
    },
    {
      key: 'diagnosis',
      header: 'Diagnóstico',
      className: 'max-w-[340px]',
      cell: row => row.diagnosis
        ? <span className="text-xs text-muted-foreground line-clamp-2">{row.diagnosis}</span>
        : <span className="text-xs text-muted-foreground italic">Gerando…</span>,
    },
    {
      key: 'opened_at',
      header: 'Aberto em',
      cell: row => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.opened_at).toLocaleString('pt-BR')}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <FilterCell label="Status" value={statusLabel} open={statusOpen} onToggle={() => setStatusOpen(v => !v)} dropRef={statusRef}>
          <Opt label="Qualquer" onClick={() => { setFilters(f => ({ ...f, status: undefined, page: 1 })); setStatusOpen(false) }} />
          <Opt label="Aberto"         onClick={() => { setFilters(f => ({ ...f, status: 'open',           page: 1 })); setStatusOpen(false) }} />
          <Opt label="Em campo"       onClick={() => { setFilters(f => ({ ...f, status: 'in_field',       page: 1 })); setStatusOpen(false) }} />
          <Opt label="Resolvido"      onClick={() => { setFilters(f => ({ ...f, status: 'resolved',       page: 1 })); setStatusOpen(false) }} />
          <Opt label="Fechado"        onClick={() => { setFilters(f => ({ ...f, status: 'closed',         page: 1 })); setStatusOpen(false) }} />
          <Opt label="Falso positivo" onClick={() => { setFilters(f => ({ ...f, status: 'false_positive', page: 1 })); setStatusOpen(false) }} />
        </FilterCell>

        <FilterCell label="Urgência" value={urgencyLabel} open={urgencyOpen} onToggle={() => setUrgencyOpen(v => !v)} dropRef={urgencyRef}>
          <Opt label="Qualquer" onClick={() => { setFilters(f => ({ ...f, urgency: undefined,  page: 1 })); setUrgencyOpen(false) }} />
          <Opt label="Crítico"  onClick={() => { setFilters(f => ({ ...f, urgency: 'critical', page: 1 })); setUrgencyOpen(false) }} />
          <Opt label="Alta"     onClick={() => { setFilters(f => ({ ...f, urgency: 'high',     page: 1 })); setUrgencyOpen(false) }} />
          <Opt label="Média"    onClick={() => { setFilters(f => ({ ...f, urgency: 'medium',   page: 1 })); setUrgencyOpen(false) }} />
          <Opt label="Baixa"    onClick={() => { setFilters(f => ({ ...f, urgency: 'low',      page: 1 })); setUrgencyOpen(false) }} />
        </FilterCell>

        <FilterCell label="OLT" value={oltLabel} open={oltOpen} onToggle={() => setOltOpen(v => !v)} dropRef={oltRef}>
          <Opt label="Qualquer" onClick={() => { setFilters(f => ({ ...f, olt_id: undefined, page: 1 })); setOltOpen(false) }} />
          {oltOptions.map(o => (
            <Opt key={o.id} label={o.name} onClick={() => { setFilters(f => ({ ...f, olt_id: o.id, page: 1 })); setOltOpen(false) }} />
          ))}
        </FilterCell>

        {data && (
          <span className="ml-auto text-xs text-muted-foreground">
            {data.total} ticket{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={loading}
        skeletonRows={10}
        emptyText="Nenhum ticket encontrado."
        page={filters.page ?? 1}
        pageSize={filters.page_size ?? 50}
        total={data?.total}
        onPageChange={page => setFilters(f => ({ ...f, page }))}
        onRowClick={row => router.push(`/onus/${row.onu_id}`)}
        headerRowClassName="bg-[hsl(var(--primary))]"
        headerCellClassName="!text-white"
        containerClassName="relative w-full overflow-auto border-0 rounded-none"
        bodyClassName="bg-transparent divide-y-0"
        rowClassName="odd:bg-[hsl(var(--secondary))]/20 odd:hover:bg-[hsl(var(--secondary))]/20 hover:bg-transparent border-none cursor-pointer"
      />
    </div>
  )
}
