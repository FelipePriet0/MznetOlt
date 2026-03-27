"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { onuApi, type OnuItem, type OnuListFilters } from '@/lib/api/onu'
import { oltApi, type OltItem } from '@/lib/api/olt'
import { settingsApi, type ZoneItem } from '@/lib/api/settings'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Wifi, WifiOff, PlugZap, Signal, Ban, Search, ChevronDown,
  Eye, Download, Wrench, Lock, Check,
} from 'lucide-react'

/* ─── Signal chip (tabela) ───────────────────────────────────── */
function SignalChip({ dbm }: { dbm: number | null }) {
  if (dbm === null) return <span className="text-xs text-muted-foreground">—</span>
  const v = dbm < -27 ? 'text-destructive' : dbm < -24 ? 'text-warning' : 'text-success'
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-mono font-bold', v)}>
      <Signal className="h-4 w-4" strokeWidth={3} />
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
  /** Marca o filtro como não implementado — exibe "Em breve" e bloqueia interação */
  disabled?: boolean
}
function FilterCell({ label, value, open, onToggle, dropRef, children, disabled }: FilterCellProps) {
  return (
    <div
      ref={dropRef}
      className={cn('flex-1 min-w-0 flex items-center gap-1.5', disabled && 'opacity-40')}
    >
      <span className="text-xs font-bold whitespace-nowrap shrink-0">{label}</span>
      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={disabled ? undefined : onToggle}
          disabled={disabled}
          title={disabled ? 'Em breve' : undefined}
          className={cn(
            'w-full h-8 flex items-center justify-between gap-1 rounded-md border border-input bg-background px-2.5 text-xs transition-colors duration-200',
            !disabled && 'hover:bg-muted hover:text-foreground',
            disabled && 'cursor-not-allowed',
            open && !disabled && 'border-ring ring-2 ring-ring ring-offset-2 ring-offset-background',
          )}
        >
          <span className="truncate">{disabled ? 'Em breve' : value}</span>
          {disabled
            ? <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
            : <ChevronDown className={cn('h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
          }
        </button>
        {open && !disabled && (
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

/* ─── CheckOpt: checkbox item para multi-seleção ─────────────── */
function CheckOpt({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm hover:bg-muted transition-colors"
      onClick={onClick}
    >
      <div className={cn(
        'h-4 w-4 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors',
        checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background',
      )}>
        {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </div>
      <span className="truncate text-left">{label}</span>
    </button>
  )
}

/* ─── multiLabel: texto do botão para multi-seleção ──────────── */
function multiLabel<T extends number>(
  set: Set<T>,
  options: { id: T; name: string }[],
  noun: string,
): string {
  if (!set.size) return 'Qualquer'
  if (set.size === 1) {
    const id = Array.from(set)[0]
    return options.find(o => o.id === id)?.name ?? `#${id}`
  }
  return `${set.size} ${noun}`
}

/* ─── Types ───────────────────────────────────────────────────── */
type StatusIconKey = 'online' | 'power_fail' | 'loss_signal' | 'offline' | 'admin_disabled'

/* ─── Page ────────────────────────────────────────────────────── */
export default function OnusConfiguredPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters,     setFilters]     = useState<OnuListFilters>({ page: 1, page_size: 50, status_in: ['online','offline'] })
  const [statusSet,   setStatusSet]   = useState<Set<StatusIconKey>>(new Set())
  const [signalSet,   setSignalSet]   = useState<Set<'good' | 'warning' | 'critical'>>(new Set())
  const [searchInput, setSearchInput] = useState('')

  // Multi-select Sets para filtros de topologia
  const [oltSet,     setOltSet]     = useState<Set<number>>(new Set())
  const [boardSet,   setBoardSet]   = useState<Set<number>>(new Set())
  const [portSet,    setPortSet]    = useState<Set<number>>(new Set())
  const [zoneSet,    setZoneSet]    = useState<Set<number>>(new Set())

  const [oltOpen,     setOltOpen]     = useState(false)
  const [boardOpen,   setBoardOpen]   = useState(false)
  const [portOpen,    setPortOpen]    = useState(false)
  const [zoneOpen,    setZoneOpen]    = useState(false)
  const [odbOpen,     setOdbOpen]     = useState(false)
  const [vlanOpen,    setVlanOpen]    = useState(false)
  // removed: Tipo de ONU filter
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
  // removed: Tipo de ONU filter ref
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
    [profileRef, setProfileOpen], [ponTypeRef, setPonTypeOpen],
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
  const boards   = useApi(() => oltApi.allBoards(),   [])
  const ponPorts = useApi(() => oltApi.allPonPorts(), [])
  // onu types feature removed
  const zones = useApi(() => settingsApi.zones(), [])
  const fetcher = useCallback(() => onuApi.list(filters), [filters])
  const { data, loading, refetch } = useApi(fetcher, [filters])

  useEffect(() => {
    const s = searchParams.get('status') || undefined
    if (s === 'online' || s === 'offline') {
      setStatusSet(new Set([s as StatusIconKey]))
      setFilters(f => ({ ...f, status_in: [s], admin_state_in: undefined, page: 1 }))
    } else {
      // Base padrão rígida: somente ONUs online/offline (exclui 'unconfigured' e 'admin_disabled')
      setFilters(f => ({ ...f, status_in: ['online','offline'], admin_state_in: undefined, page: 1 }))
    }

    const sig = searchParams.get('signal') || undefined
    if (sig) {
      const levels = sig.split(',').filter(
        l => l === 'warning' || l === 'critical' || l === 'good'
      ) as ('good' | 'warning' | 'critical')[]
      if (levels.length) {
        setSignalSet(new Set(levels))
        setFilters(f => ({ ...f, signal_levels: levels as any, page: 1 }))
      }
    }

    const qOlt = searchParams.get('olt_id')
    if (qOlt) {
      const id = Number(qOlt)
      if (!isNaN(id)) {
        setOltSet(new Set([id]))
        setFilters(f => ({ ...f, olt_ids: [id], page: 1 }))
      }
    }
  }, [searchParams])

  // Atualiza filtros automaticamente ao digitar/apagar (debounced)
  useEffect(() => {
    const handle = setTimeout(() => {
      const term = searchInput.trim()
      setFilters(f => ({ ...f, search: term || undefined, page: 1 }))
    }, 300)
    return () => clearTimeout(handle)
  }, [searchInput])

  const oltOptions: OltItem[] = olts.data?.items ?? []
  const boardOptions = boards.data?.items ?? []
  const portOptions = ponPorts.data?.items ?? []
  const zoneOptions: ZoneItem[] = zones.data?.items ?? []
  const onuTypeOptions: { id: number; name: string }[] = []

  function toggleStatus(key: StatusIconKey) {
    if (key === 'admin_disabled') return
    setStatusSet(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      // Build filters
      let statuses = Array.from(next)
      const admin: string[] = []
      if (statuses.length === 0) {
        // Se usuário desmarcar tudo, mantém base de configuradas (online/offline)
        statuses = ['online','offline']
      }
      setFilters(f => ({
        ...f,
        page: 1,
        status_in: statuses.length ? statuses : undefined,
        admin_state_in: undefined,
      }))
      return next
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
    // Nome da conexão
    { key: 'name', header: 'Nome', className: 'max-w-[200px] whitespace-normal break-words',
      cell: row => row.name
        ? <span className="text-sm font-medium break-words">{row.name}</span>
        : <span className="text-sm text-muted-foreground">—</span> },
    // SN / MAC
    { key: 'sn',  header: 'SN / MAC',
      cell: row => <span className="font-mono text-sm">{row.serial_number}</span> },
    // ONU (placeholder)
    { key: 'onu', header: 'ONU',
      cell: row => (row.onu_index ?? null) !== null
        ? <span className="text-sm">{row.onu_index}</span>
        : <span className="text-sm text-muted-foreground">—</span> },
    // Zona (placeholder)
    { key: 'zone', header: 'Zona',
      cell: row => row.zone_name
        ? <span className="text-sm">{row.zone_name}</span>
        : <span className="text-sm text-muted-foreground">—</span> },
    // ODB (placeholder)
    { key: 'odb', header: 'ODB',
      cell: row => (row.odb_name || row.odb_splitter)
        ? <span className="text-sm">{row.odb_name ?? row.odb_splitter}</span>
        : <span className="text-sm text-muted-foreground">—</span> },
    // Sinal
    { key: 'signal', header: 'Sinal',
      cell: row => <SignalChip dbm={row.last_known_signal} /> },
    // B/R (placeholder)
    { key: 'br', header: 'B/R',
      cell: row => row.mode
        ? <span className="text-sm font-bold">{row.mode?.toLowerCase() === 'bridge' ? 'B' : row.mode?.toLowerCase() === 'router' ? 'R' : row.mode}</span>
        : <span className="text-sm text-muted-foreground">—</span> },
    // VLAN (placeholder)
    { key: 'vlan', header: 'VLAN',
      cell: row => (row.vlan_id ?? null) !== null
        ? <span className="text-sm">{row.vlan_id}</span>
        : <span className="text-sm text-muted-foreground">—</span> },
    // VoIP (placeholder)
    { key: 'voip', header: 'VoIP',
      cell: row => row.voip_enabled === true ? (
        <span className="text-sm">Sim</span>
      ) : row.voip_enabled === false ? (
        <span className="text-sm">Não</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ) },
    // TV (placeholder)
    { key: 'tv', header: 'TV',
      cell: row => row.catv_enabled === true ? (
        <span className="text-sm">Sim</span>
      ) : row.catv_enabled === false ? (
        <span className="text-sm">Não</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ) },
    // Tipo (vendor + model)
    { key: 'type', header: 'Tipo',
      cell: row => <span className="text-sm">{row.onu_vendor ?? '—'} {row.onu_model ?? ''}</span> },
    // Data de autenticação
    { key: 'auth', header: 'Data de autenticação',
      cell: row => (
        <span className="text-sm text-muted-foreground">
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
                className="h-8 pl-8 text-xs w-full"
              />
            </div>
          </div>

          {/* ── OLT multi-select ── */}
          <FilterCell
            label="OLT"
            value={multiLabel(oltSet, oltOptions.map(o => ({ id: o.id, name: `[${o.id}] ${o.name}` })), 'OLTs')}
            open={oltOpen} onToggle={() => setOltOpen(v => !v)} dropRef={oltRef}
          >
            <CheckOpt label="Qualquer (limpar)" checked={oltSet.size === 0}
              onClick={() => { setOltSet(new Set()); setFilters(f => ({ ...f, olt_ids: undefined, page: 1 })) }} />
            {oltOptions.map(o => (
              <CheckOpt key={o.id} label={`[${o.id}] ${o.name}`} checked={oltSet.has(o.id)}
                onClick={() => {
                  setOltSet(prev => {
                    const next = new Set(prev)
                    next.has(o.id) ? next.delete(o.id) : next.add(o.id)
                    const arr = Array.from(next)
                    setFilters(f => ({ ...f, olt_ids: arr.length ? arr : undefined, page: 1 }))
                    return next
                  })
                }} />
            ))}
          </FilterCell>

          {/* ── Quadro multi-select ── */}
          <FilterCell
            label="Quadro"
            value={multiLabel(boardSet, boardOptions.map(b => ({ id: b.id, name: b.name })), 'quadros')}
            open={boardOpen} onToggle={() => setBoardOpen(v => !v)} dropRef={boardRef}
          >
            <CheckOpt label="Qualquer (limpar)" checked={boardSet.size === 0}
              onClick={() => { setBoardSet(new Set()); setFilters(f => ({ ...f, board_ids: undefined, page: 1 })) }} />
            {boardOptions.map(b => (
              <CheckOpt key={b.id} label={b.name} checked={boardSet.has(b.id)}
                onClick={() => {
                  setBoardSet(prev => {
                    const next = new Set(prev)
                    next.has(b.id) ? next.delete(b.id) : next.add(b.id)
                    const arr = Array.from(next)
                    setFilters(f => ({ ...f, board_ids: arr.length ? arr : undefined, page: 1 }))
                    return next
                  })
                }} />
            ))}
          </FilterCell>

          {/* ── Porta multi-select ── */}
          <FilterCell
            label="Porta"
            value={multiLabel(portSet, portOptions.map(p => ({ id: p.id, name: p.name })), 'portas')}
            open={portOpen} onToggle={() => setPortOpen(v => !v)} dropRef={portRef}
          >
            <CheckOpt label="Qualquer (limpar)" checked={portSet.size === 0}
              onClick={() => { setPortSet(new Set()); setFilters(f => ({ ...f, pon_port_ids: undefined, page: 1 })) }} />
            {portOptions.map(p => (
              <CheckOpt key={p.id} label={p.name} checked={portSet.has(p.id)}
                onClick={() => {
                  setPortSet(prev => {
                    const next = new Set(prev)
                    next.has(p.id) ? next.delete(p.id) : next.add(p.id)
                    const arr = Array.from(next)
                    setFilters(f => ({ ...f, pon_port_ids: arr.length ? arr : undefined, page: 1 }))
                    return next
                  })
                }} />
            ))}
          </FilterCell>

          {/* ── Zona multi-select ── */}
          <FilterCell
            label="Zona"
            value={multiLabel(zoneSet, zoneOptions.map(z => ({ id: z.id, name: z.name })), 'zonas')}
            open={zoneOpen} onToggle={() => setZoneOpen(v => !v)} dropRef={zoneRef}
          >
            <CheckOpt label="Qualquer (limpar)" checked={zoneSet.size === 0}
              onClick={() => { setZoneSet(new Set()); setFilters(f => ({ ...f, zone_ids: undefined, page: 1 })) }} />
            {zoneOptions.map(z => (
              <CheckOpt key={z.id} label={z.name} checked={zoneSet.has(z.id)}
                onClick={() => {
                  setZoneSet(prev => {
                    const next = new Set(prev)
                    next.has(z.id) ? next.delete(z.id) : next.add(z.id)
                    const arr = Array.from(next)
                    setFilters(f => ({ ...f, zone_ids: arr.length ? arr : undefined, page: 1 }))
                    return next
                  })
                }} />
            ))}
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

          {/* Tipo ONU filter removido */}

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
                <IconBtn key={key} pressed={statusSet.has(key)} title={title}
                  onClick={() => toggleStatus(key)}>
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
                <IconBtn key={s.key} pressed={signalSet.has(s.key)} title={s.title}
                  onClick={() => setSignalSet(prev => {
                    const next = new Set(prev)
                    if (next.has(s.key)) next.delete(s.key); else next.add(s.key)
                    const arr = Array.from(next)
                    setFilters(f => ({ ...f, page: 1, signal_levels: arr.length ? arr as any : undefined }))
                    return next
                  })}>
                  <SignalBars color={s.color} />
                </IconBtn>
              ))}
            </div>
          </div>

          {/* Bridge / Router — Em breve (sem coluna no banco) */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5" title="B/R">
            <span className="text-xs font-bold whitespace-nowrap shrink-0">B/R</span>
            <div className="flex items-center gap-1">
              <button type="button"
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background">
                <span className="text-[11px] font-bold">B</span>
              </button>
              <button type="button"
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background">
                <span className="text-[11px] font-bold">R</span>
              </button>
            </div>
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
        headerRowClassName="bg-[hsl(var(--primary))]"
        headerCellClassName="!text-white"
        containerClassName="relative w-full overflow-auto border-0 rounded-none"
        bodyClassName="bg-transparent divide-y-0"
        rowClassName="odd:bg-[hsl(var(--secondary))]/20 odd:hover:bg-[hsl(var(--secondary))]/20 hover:bg-transparent border-none"
      />
    </div>
  )
}
