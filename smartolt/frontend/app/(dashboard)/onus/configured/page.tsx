"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { onuApi, type OnuItem, type OnuListFilters } from '@/lib/api/onu'
import { oltApi, type OltItem } from '@/lib/api/olt'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Wifi, WifiOff, PlugZap, Signal, Ban, Search, ChevronDown,
  RefreshCw, Eye, Download, Wrench,
} from 'lucide-react'

/* ─── Signal chip (tabela) ───────────────────────────────────── */
function SignalChip({ dbm }: { dbm: number | null }) {
  if (dbm === null) return <span className="text-xs text-muted-foreground">—</span>
  const v = dbm < -27 ? 'text-destructive' : dbm < -24 ? 'text-warning' : 'text-success'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-mono font-medium', v)}>
      <Signal className="h-3 w-3" />
      {dbm} dBm
    </span>
  )
}

/* ─── Barras de sinal (filtro) ───────────────────────────────── */
function SignalBars({ color }: { color: string }) {
  return (
    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
      <rect x="0"  y="7"   width="3.5" height="4"  rx="0.5" fill={color} />
      <rect x="5"  y="3.5" width="3.5" height="7.5" rx="0.5" fill={color} />
      <rect x="10" y="0"   width="3.5" height="11" rx="0.5" fill={color} />
    </svg>
  )
}

/* ─── FilterCell: label bold + dropdown botão w-full ─────────── */
interface FilterCellProps {
  label: string
  value: string
  open: boolean
  onToggle: () => void
  dropRef: React.RefObject<HTMLDivElement>
  children: React.ReactNode
}
function FilterCell({ label, value, open, onToggle, dropRef, children }: FilterCellProps) {
  return (
    <div ref={dropRef} className="flex-1 min-w-0 flex items-center gap-1.5">
      <span className="text-xs font-bold whitespace-nowrap shrink-0">{label}</span>
      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'w-full h-8 flex items-center justify-between gap-1 rounded-md border border-input bg-background px-2.5 text-xs transition-colors duration-200 hover:bg-muted hover:text-foreground',
            open && 'border-ring ring-2 ring-ring ring-offset-2 ring-offset-background',
          )}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className={cn('h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute left-0 z-30 mt-1 min-w-[160px] w-full rounded-md border border-input bg-popover p-1 shadow-lg">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

function Opt({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="w-full text-left px-3 py-1.5 text-xs rounded-sm hover:bg-muted transition-colors"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

/* ─── Types ───────────────────────────────────────────────────── */
type StatusIconKey = 'online' | 'power_fail' | 'loss_signal' | 'offline' | 'admin_disabled'

/* ─── Page ────────────────────────────────────────────────────── */
export default function OnusConfiguredPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters,     setFilters]     = useState<OnuListFilters>({ page: 1, page_size: 50, status: 'configured' })
  const [statusIcon,  setStatusIcon]  = useState<StatusIconKey | null>(null)
  const [brMode,      setBrMode]      = useState<'bridge' | 'router' | null>(null)
  const [signalLevel, setSignalLevel] = useState<'good' | 'warning' | 'critical' | null>(null)
  const [searchInput, setSearchInput] = useState('')

  const [oltOpen,     setOltOpen]     = useState(false)
  const [boardOpen,   setBoardOpen]   = useState(false)
  const [portOpen,    setPortOpen]    = useState(false)
  const [zoneOpen,    setZoneOpen]    = useState(false)
  const [odbOpen,     setOdbOpen]     = useState(false)
  const [vlanOpen,    setVlanOpen]    = useState(false)
  const [onuTypeOpen, setOnuTypeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [ponTypeOpen, setPonTypeOpen] = useState(false)
  const [mgmtOpen,    setMgmtOpen]    = useState(false)
  const [tr069Open,   setTr069Open]   = useState(false)
  const [voipOpen,    setVoipOpen]    = useState(false)
  const [catvOpen,    setCatvOpen]    = useState(false)
  const [dlOpen,      setDlOpen]      = useState(false)
  const [ulOpen,      setUlOpen]      = useState(false)

  const oltRef     = useRef<HTMLDivElement>(null)
  const boardRef   = useRef<HTMLDivElement>(null)
  const portRef    = useRef<HTMLDivElement>(null)
  const zoneRef    = useRef<HTMLDivElement>(null)
  const odbRef     = useRef<HTMLDivElement>(null)
  const vlanRef    = useRef<HTMLDivElement>(null)
  const onuTypeRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const ponTypeRef = useRef<HTMLDivElement>(null)
  const mgmtRef    = useRef<HTMLDivElement>(null)
  const tr069Ref   = useRef<HTMLDivElement>(null)
  const voipRef    = useRef<HTMLDivElement>(null)
  const catvRef    = useRef<HTMLDivElement>(null)
  const dlRef      = useRef<HTMLDivElement>(null)
  const ulRef      = useRef<HTMLDivElement>(null)

  const allDropdowns: [React.RefObject<HTMLDivElement>, React.Dispatch<React.SetStateAction<boolean>>][] = [
    [oltRef, setOltOpen], [boardRef, setBoardOpen], [portRef, setPortOpen],
    [zoneRef, setZoneOpen], [odbRef, setOdbOpen], [vlanRef, setVlanOpen],
    [onuTypeRef, setOnuTypeOpen], [profileRef, setProfileOpen], [ponTypeRef, setPonTypeOpen],
    [mgmtRef, setMgmtOpen], [tr069Ref, setTr069Open], [voipRef, setVoipOpen],
    [catvRef, setCatvOpen], [dlRef, setDlOpen], [ulRef, setUlOpen],
  ]

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      for (const [ref, setOpen] of allDropdowns) {
        if (ref.current && !ref.current.contains(t)) setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') allDropdowns.forEach(([, s]) => s(false))
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const olts = useApi(() => oltApi.list({ page_size: 1000 }))
  const fetcher = useCallback(() => onuApi.list(filters), [filters])
  const { data, loading, refetch } = useApi(fetcher, [filters])

  useEffect(() => {
    const s = searchParams.get('status') || undefined
    if (s === 'online' || s === 'offline') {
      setStatusIcon(s as StatusIconKey)
      setFilters(f => ({ ...f, status: s, admin_state: undefined, page: 1 }))
    } else if (s === 'admin_disabled') {
      setStatusIcon('admin_disabled')
      setFilters(f => ({ ...f, status: undefined, admin_state: 'disabled', page: 1 }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applySearch() {
    setFilters(f => ({ ...f, serial_number: searchInput || undefined, page: 1 }))
  }

  const oltOptions: OltItem[] = olts.data?.items ?? []
  const boardOptions = useMemo(() => {
    const m = new Map<number, string>()
    for (const it of data?.items ?? []) m.set(it.board_id, it.board_name)
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }))
  }, [data])
  const portOptions = useMemo(() => {
    const m = new Map<number, string>()
    for (const it of data?.items ?? []) m.set(it.pon_port_id, it.pon_port_name)
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }))
  }, [data])

  function applyStatus(key: StatusIconKey | null) {
    setStatusIcon(key)
    setFilters(f => {
      const base = { ...f, page: 1 }
      if (!key) return { ...base, status: 'configured', admin_state: undefined }
      switch (key) {
        case 'online':         return { ...base, status: 'online',  admin_state: undefined }
        case 'offline':        return { ...base, status: 'offline', admin_state: undefined }
        case 'admin_disabled': return { ...base, admin_state: 'disabled', status: undefined }
        default:               return { ...base, status: 'offline', admin_state: undefined }
      }
    })
  }

  const columns: Column<OnuItem & { view?: string }>[] = [
    // Status
    { key: 'status', header: 'Status',
      cell: row => <StatusBadge status={row.status} pulse={row.status === 'online'} /> },
    // Visualizar
    { key: 'view', header: 'Visualizar',
      cell: row => (
        <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); router.push(`/onus/${row.id}`) }}>
          <Eye className="h-3.5 w-3.5" /> Ver
        </Button>
      ) },
    // Nome (placeholder)
    { key: 'name', header: 'Nome',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // SN / MAC
    { key: 'sn',  header: 'SN / MAC',
      cell: row => <span className="font-mono text-sm">{row.serial_number}</span> },
    // ONU (placeholder)
    { key: 'onu', header: 'ONU',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // Zona (placeholder)
    { key: 'zone', header: 'Zona',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // ODB (placeholder)
    { key: 'odb', header: 'ODB',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // Sinal
    { key: 'signal', header: 'Sinal',
      cell: row => <SignalChip dbm={row.last_known_signal} /> },
    // B/R (placeholder)
    { key: 'br', header: 'B/R',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // VLAN (placeholder)
    { key: 'vlan', header: 'VLAN',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // VoIP (placeholder)
    { key: 'voip', header: 'VoIP',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // TV (placeholder)
    { key: 'tv', header: 'TV',
      cell: _ => <span className="text-sm text-muted-foreground">—</span> },
    // Tipo (vendor + model)
    { key: 'type', header: 'Tipo',
      cell: row => <span className="text-sm">{row.onu_vendor ?? '—'} {row.onu_model ?? ''}</span> },
    // Data de autenticação
    { key: 'auth', header: 'Data de autenticação',
      cell: row => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString('pt-BR')}
        </span>
      ) },
  ]

  function exportCsv() {
    const rows = (data?.items ?? []).map(it => ({
      status: it.status, serial: it.serial_number, olt: it.olt_name,
      board: it.board_name, port: it.pon_port_name,
      vendor: it.onu_vendor ?? '', model: it.onu_model ?? '',
      signal: it.last_known_signal ?? '', created_at: it.created_at,
    }))
    const header = Object.keys(rows[0] ?? { status: '', serial: '' })
    const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'onus-configuradas.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  /* ── icon button helper ── */
  function IconBtn({ pressed, onClick, title, children }: {
    pressed: boolean; onClick: () => void; title: string; children: React.ReactNode
  }) {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        className={cn(
          'h-8 w-8 inline-flex items-center justify-center rounded-md border border-input transition-colors duration-200',
          pressed
            ? 'border-ring bg-primary/10 text-primary ring-2 ring-ring ring-offset-1 ring-offset-background'
            : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">

      {/* Actions (no title/subtitle) */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </Button>
        <Button size="sm" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> Exportar
        </Button>
      </div>

      {/* ── Filter Panel (no card background) ───────────────────── */}
      <div className="space-y-2">

        {/* ── Linha 1: Busca + Topologia ── */}
        <div className="flex items-center gap-2 w-full">

          {/* Procurar — flex-[2] pois tem input */}
          <div className="flex-[2] min-w-0 flex items-center gap-1.5">
            <span className="text-xs font-bold whitespace-nowrap shrink-0">Procurar</span>
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="SN, IP, nome, endereço…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applySearch()}
                className="h-8 pl-8 text-xs w-full"
              />
            </div>
          </div>

          <FilterCell label="OLT" value={filters.olt_id ? `#${filters.olt_id}` : 'Qualquer'}
            open={oltOpen} onToggle={() => setOltOpen(v => !v)} dropRef={oltRef}>
            <Opt label="Qualquer" onClick={() => { setFilters(f => ({ ...f, olt_id: undefined, page: 1 })); setOltOpen(false) }} />
            {oltOptions.map(o => (
              <Opt key={o.id} label={`[${o.id}] ${o.name}`} onClick={() => { setFilters(f => ({ ...f, olt_id: o.id, page: 1 })); setOltOpen(false) }} />
            ))}
          </FilterCell>

          <FilterCell label="Quadro" value={filters.board_id ? `Board ${filters.board_id}` : 'Qualquer'}
            open={boardOpen} onToggle={() => setBoardOpen(v => !v)} dropRef={boardRef}>
            <Opt label="Qualquer" onClick={() => { setFilters(f => ({ ...f, board_id: undefined, page: 1 })); setBoardOpen(false) }} />
            {boardOptions.map(b => (
              <Opt key={b.id} label={b.name} onClick={() => { setFilters(f => ({ ...f, board_id: b.id, page: 1 })); setBoardOpen(false) }} />
            ))}
          </FilterCell>

          <FilterCell label="Porta" value={filters.pon_port_id ? `Porta ${filters.pon_port_id}` : 'Qualquer'}
            open={portOpen} onToggle={() => setPortOpen(v => !v)} dropRef={portRef}>
            <Opt label="Qualquer" onClick={() => { setFilters(f => ({ ...f, pon_port_id: undefined, page: 1 })); setPortOpen(false) }} />
            {portOptions.map(p => (
              <Opt key={p.id} label={p.name} onClick={() => { setFilters(f => ({ ...f, pon_port_id: p.id, page: 1 })); setPortOpen(false) }} />
            ))}
          </FilterCell>

          <FilterCell label="Zona" value="Qualquer"
            open={zoneOpen} onToggle={() => setZoneOpen(v => !v)} dropRef={zoneRef}>
            <Opt label="Qualquer" onClick={() => setZoneOpen(false)} />
          </FilterCell>

          <FilterCell label="ODB" value="Qualquer"
            open={odbOpen} onToggle={() => setOdbOpen(v => !v)} dropRef={odbRef}>
            <Opt label="Qualquer" onClick={() => setOdbOpen(false)} />
          </FilterCell>

        </div>

        

        {/* ── Linha 2: VLAN + Dispositivo + Status + Sinal + B/R ── */}
        <div className="flex items-center gap-2 w-full">

          <FilterCell label="VLAN" value="Qualquer"
            open={vlanOpen} onToggle={() => setVlanOpen(v => !v)} dropRef={vlanRef}>
            <Opt label="Qualquer" onClick={() => setVlanOpen(false)} />
          </FilterCell>

          <FilterCell label="Tipo ONU" value="Qualquer"
            open={onuTypeOpen} onToggle={() => setOnuTypeOpen(v => !v)} dropRef={onuTypeRef}>
            <Opt label="Qualquer" onClick={() => setOnuTypeOpen(false)} />
          </FilterCell>

          <FilterCell label="Perfil" value="Qualquer"
            open={profileOpen} onToggle={() => setProfileOpen(v => !v)} dropRef={profileRef}>
            <Opt label="Qualquer" onClick={() => setProfileOpen(false)} />
          </FilterCell>

          <FilterCell label="Tipo PON" value="Qualquer"
            open={ponTypeOpen} onToggle={() => setPonTypeOpen(v => !v)} dropRef={ponTypeRef}>
            <Opt label="Qualquer" onClick={() => setPonTypeOpen(false)} />
          </FilterCell>

          {/* Status ícones */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <span className="text-xs font-bold whitespace-nowrap shrink-0">Status</span>
            <div className="flex items-center gap-1">
              {([
                { key: 'online'         as StatusIconKey, Icon: Wifi,    title: 'Online'             },
                { key: 'power_fail'     as StatusIconKey, Icon: PlugZap, title: 'Falta de energia'   },
                { key: 'loss_signal'    as StatusIconKey, Icon: Wrench,  title: 'Perda de sinal'     },
                { key: 'offline'        as StatusIconKey, Icon: WifiOff, title: 'Offline'            },
                { key: 'admin_disabled' as StatusIconKey, Icon: Ban,     title: 'Admin desabilitado' },
              ]).map(({ key, Icon, title }) => (
                <IconBtn key={key} pressed={statusIcon === key} title={title}
                  onClick={() => applyStatus(statusIcon === key ? null : key)}>
                  <Icon className="h-3.5 w-3.5" />
                </IconBtn>
              ))}
            </div>
          </div>

          {/* Sinal barras */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <span className="text-xs font-bold whitespace-nowrap shrink-0">Sinal</span>
            <div className="flex items-center gap-1">
              {([
                { key: 'good'     as const, color: '#22c55e', title: 'Bom (> -24 dBm)'         },
                { key: 'warning'  as const, color: '#f59e0b', title: 'Atenção (-24 a -27 dBm)'  },
                { key: 'critical' as const, color: '#ef4444', title: 'Crítico (< -27 dBm)'      },
              ]).map(s => (
                <IconBtn key={s.key} pressed={signalLevel === s.key} title={s.title}
                  onClick={() => setSignalLevel(p => p === s.key ? null : s.key)}>
                  <SignalBars color={s.color} />
                </IconBtn>
              ))}
            </div>
          </div>

          {/* Bridge / Router */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <IconBtn pressed={brMode === 'bridge'} title="Bridge"
              onClick={() => setBrMode(p => p === 'bridge' ? null : 'bridge')}>
              <span className="text-[11px] font-bold">B</span>
            </IconBtn>
            <IconBtn pressed={brMode === 'router'} title="Router"
              onClick={() => setBrMode(p => p === 'router' ? null : 'router')}>
              <span className="text-[11px] font-bold">R</span>
            </IconBtn>
          </div>

        </div>

        <div className="border-t border-border/50" />

        {/* ── Linha 3: Serviços ── */}
        <div className="flex items-center gap-2 w-full">

          <FilterCell label="Gestão de IP" value="Qualquer"
            open={mgmtOpen} onToggle={() => setMgmtOpen(v => !v)} dropRef={mgmtRef}>
            <Opt label="Qualquer" onClick={() => setMgmtOpen(false)} />
            <Opt label="Com IP"   onClick={() => setMgmtOpen(false)} />
            <Opt label="Sem IP"   onClick={() => setMgmtOpen(false)} />
          </FilterCell>

          <FilterCell label="TR-069" value="Qualquer"
            open={tr069Open} onToggle={() => setTr069Open(v => !v)} dropRef={tr069Ref}>
            <Opt label="Qualquer"   onClick={() => setTr069Open(false)} />
            <Opt label="Habilitado" onClick={() => setTr069Open(false)} />
            <Opt label="Desativado" onClick={() => setTr069Open(false)} />
          </FilterCell>

          <FilterCell label="VoIP" value="Qualquer"
            open={voipOpen} onToggle={() => setVoipOpen(v => !v)} dropRef={voipRef}>
            <Opt label="Qualquer"   onClick={() => setVoipOpen(false)} />
            <Opt label="Habilitado" onClick={() => setVoipOpen(false)} />
            <Opt label="Desativado" onClick={() => setVoipOpen(false)} />
          </FilterCell>

          <FilterCell label="CATV" value="Qualquer"
            open={catvOpen} onToggle={() => setCatvOpen(v => !v)} dropRef={catvRef}>
            <Opt label="Qualquer"   onClick={() => setCatvOpen(false)} />
            <Opt label="Habilitado" onClick={() => setCatvOpen(false)} />
            <Opt label="Desativado" onClick={() => setCatvOpen(false)} />
          </FilterCell>

          <FilterCell label="Download" value="Qualquer"
            open={dlOpen} onToggle={() => setDlOpen(v => !v)} dropRef={dlRef}>
            <Opt label="Qualquer" onClick={() => setDlOpen(false)} />
          </FilterCell>

          <FilterCell label="Carregar" value="Qualquer"
            open={ulOpen} onToggle={() => setUlOpen(v => !v)} dropRef={ulRef}>
            <Opt label="Qualquer" onClick={() => setUlOpen(false)} />
          </FilterCell>

        </div>

      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={loading}
        skeletonRows={10}
        emptyText="Nenhuma ONU encontrada. Tente ajustar os filtros."
        page={filters.page ?? 1}
        pageSize={filters.page_size ?? 50}
        total={data?.total}
        onPageChange={page => setFilters(f => ({ ...f, page }))}
        onRowClick={row => router.push(`/onus/${row.id}`)}
        headerRowClassName="bg-[hsl(var(--secondary))]"
        headerCellClassName="!text-white"
      />
    </div>
  )
}
