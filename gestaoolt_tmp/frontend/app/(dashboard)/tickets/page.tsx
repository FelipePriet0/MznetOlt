"use client"

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onuApi } from '@/lib/api/onu'
import { useApi } from '@/hooks/use-api'
import { diagnosticsApi, type TicketItem, type TicketFilters } from '@/lib/api/diagnostics'
import { DataTable, type Column } from '@/components/shared/data-table'
import { cn } from '@/lib/utils'
import { AlertTriangle, AlertCircle, Info, Zap, LayoutGrid } from 'lucide-react'

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

/* ─── Urgency filter cards config ────────────────────────────── */
type UrgencyKey = 'all' | 'critical' | 'high' | 'medium' | 'low'

const URGENCY_CHIPS: {
  key: UrgencyKey
  label: string
  Icon: React.ElementType
  activeBg: string
  iconActiveBg: string
  iconColor: string
  countColor: string
}[] = [
  {
    key: 'critical',
    label: 'Crítico',
    Icon: Zap,
    activeBg:     'bg-red-500/10 dark:bg-red-500/10',
    iconActiveBg: 'bg-red-500/20',
    iconColor:    'text-red-500',
    countColor:   'text-red-600 dark:text-red-400',
  },
  {
    key: 'high',
    label: 'Alta',
    Icon: AlertCircle,
    activeBg:     'bg-orange-500/10 dark:bg-orange-500/10',
    iconActiveBg: 'bg-orange-500/20',
    iconColor:    'text-orange-500',
    countColor:   'text-orange-600 dark:text-orange-400',
  },
  {
    key: 'medium',
    label: 'Média',
    Icon: AlertTriangle,
    activeBg:     'bg-yellow-500/10 dark:bg-yellow-500/10',
    iconActiveBg: 'bg-yellow-500/20',
    iconColor:    'text-yellow-500',
    countColor:   'text-yellow-600 dark:text-yellow-400',
  },
  {
    key: 'low',
    label: 'Baixa',
    Icon: Info,
    activeBg:     'bg-blue-500/10 dark:bg-blue-500/10',
    iconActiveBg: 'bg-blue-500/20',
    iconColor:    'text-blue-500',
    countColor:   'text-blue-600 dark:text-blue-400',
  },
]

/* ─── Page ────────────────────────────────────────────────────── */
export default function TicketsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, page_size: 50 })
  const [selected, setSelected] = useState<TicketItem | null>(null)
  const [activeUrgency, setActiveUrgency] = useState<UrgencyKey>('all')

  const fetcher = useCallback(() => diagnosticsApi.listTickets(filters), [filters])
  const { data, loading } = useApi(fetcher, [filters])

  const counts = useApi(async () => {
    const urgencies: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low']
    const results = await Promise.all(
      urgencies.map(u => diagnosticsApi.listTickets({ urgency: u, page: 1, page_size: 1 }))
    )
    return {
      critical: results[0]?.total ?? 0,
      high:     results[1]?.total ?? 0,
      medium:   results[2]?.total ?? 0,
      low:      results[3]?.total ?? 0,
    }
  }, [])

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

  const countsData = counts.data

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-6 lg:p-8">
      <div className="rounded-lg border overflow-hidden">
        {/* ── Filter cards bar — colada no topo da tabela ── */}
        <div className="flex divide-x border-b bg-card">
          {/* Card "Todos" */}
          <button
            onClick={() => {
              setActiveUrgency('all')
              setFilters(f => ({ ...f, page: 1, urgency: undefined }))
            }}
            className={cn(
              'flex items-center gap-3 px-5 py-4 flex-1 transition-colors text-left',
              activeUrgency === 'all' ? 'bg-foreground/5' : 'hover:bg-muted/50',
            )}
          >
            <div className={cn(
              'rounded-md p-2 shrink-0',
              activeUrgency === 'all' ? 'bg-foreground/15' : 'bg-muted',
            )}>
              <LayoutGrid className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums leading-none">{data?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Todos</p>
            </div>
          </button>

          {URGENCY_CHIPS.map(chip => {
            const count = countsData?.[chip.key as keyof typeof countsData] ?? 0
            const isActive = activeUrgency === chip.key
            const { Icon } = chip
            return (
              <button
                key={chip.key}
                onClick={() => {
                  setActiveUrgency(chip.key)
                  setFilters(f => ({ ...f, page: 1, urgency: chip.key as any }))
                }}
                className={cn(
                  'flex items-center gap-3 px-5 py-4 flex-1 transition-colors text-left',
                  isActive ? chip.activeBg : 'hover:bg-muted/50',
                )}
              >
                <div className={cn(
                  'rounded-md p-2 shrink-0',
                  isActive ? chip.iconActiveBg : 'bg-muted',
                )}>
                  <Icon className={cn('h-4 w-4', isActive ? chip.iconColor : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className={cn(
                    'text-2xl font-bold tabular-nums leading-none',
                    isActive ? chip.countColor : 'text-foreground',
                  )}>
                    {count}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{chip.label}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Tabela ── */}
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
          onRowClick={row => setSelected(row)}
          headerRowClassName="bg-transparent"
          headerCellClassName="!text-[hsl(var(--primary))] font-bold"
          containerClassName="relative w-full overflow-auto border-0 rounded-none"
          bodyClassName="bg-transparent divide-y-0"
          rowClassName="odd:bg-[hsl(var(--secondary))]/20 odd:hover:bg-[hsl(var(--secondary))]/20 hover:bg-transparent border-none cursor-pointer"
        />
      </div>

      {/* Side panel ticket details */}
      {selected && (
        <TicketSidePanel ticket={selected} onClose={() => setSelected(null)} onViewOnu={() => router.push(`/onus/${selected.onu_id}`)} />
      )}
    </div>
  )
}

/* ─── Diagnosis renderer ─────────────────────────────────────── */
function DiagnosisBlock({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const heading = line.match(/^\*\*(.+)\*\*$/)
        if (heading) {
          return <h4 key={i} className="text-sm font-bold text-foreground mt-4 first:mt-0">{heading[1]}</h4>
        }
        const bullet = line.match(/^[•\-]\s+(.+)/)
        if (bullet) {
          return (
            <div key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="mt-0.5 shrink-0 text-muted-foreground">•</span>
              <span className="leading-relaxed">{bullet[1]}</span>
            </div>
          )
        }
        if (line.trim() === '') return null
        return <p key={i} className="text-sm text-foreground/90 leading-relaxed">{line}</p>
      })}
    </div>
  )
}

/* ─── Side Panel ─────────────────────────────────────────────── */
function TicketSidePanel({ ticket, onClose, onViewOnu }: { ticket: TicketItem; onClose: () => void; onViewOnu: () => void }) {
  const { data: onuDetail } = useApi(() => onuApi.detail(ticket.onu_id), [ticket.onu_id])
const detectorLabel = DETECTOR_LABEL[ticket.detector_type] ?? ticket.detector_type
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full max-w-md z-50 bg-card border-l shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Ticket</h2>
          <div className="flex items-center gap-2">
            <button onClick={onViewOnu} className="text-xs rounded-md border px-2.5 py-1 font-medium bg-foreground text-background hover:bg-foreground/90">Ver ONU →</button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nome do cliente</p>
            <p className="text-sm font-medium">{onuDetail?.name || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ONU</p>
              <p className="font-mono text-sm">{ticket.onu_serial}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Urgência</p>
              <UrgencyBadge urgency={ticket.urgency} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Problema</p>
            <p className="text-sm font-medium">{detectorLabel}</p>
          </div>
          <div>
            {ticket.diagnosis ? (
              <DiagnosisBlock text={ticket.diagnosis} />
            ) : (
              <p className="text-sm text-muted-foreground italic">Gerando…</p>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
