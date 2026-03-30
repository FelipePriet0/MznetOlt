'use client'

import { useCallback, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { oltApi, type BoardItem, type PonPortItem, type OltDetail, type UplinkPortItem } from '@/lib/api/olt'
import { settingsApi } from '@/lib/api/settings'
import { Skeleton } from '@/components/shared/skeleton'
import { Button }   from '@/components/ui/button'
import { cn }       from '@/lib/utils'
import {
  ArrowLeft, AlertTriangle, Wifi,
  Pencil, History, HardDrive,
  Lock, Eye, EyeOff, Plus, X, RotateCcw, Settings2,
} from 'lucide-react'
import Image from 'next/image'

/* ── helpers ─────────────────────────────────────────────────── */
function oltImageSrc(vendor: string): string {
  const v = vendor.toLowerCase()
  if (v.includes('zte'))       return '/olt-images/zte.png'
  if (v.includes('huawei'))    return '/olt-images/huawei.png'
  return '/olt-images/huawei.png'
}

/* ── Config row ───────────────────────────────────────────────── */
function ConfigRow({ label, value, secret }: { label: string; value: React.ReactNode; secret?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <tr className="border-b last:border-0">
      <td className="py-2.5 pr-4 text-sm text-muted-foreground w-56 align-top">{label}</td>
      <td className="py-2.5 text-sm font-medium">
        {secret ? (
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-mono">{show ? value : '••••••••••••'}</span>
            <button type="button" onClick={() => setShow(s => !s)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : value}
      </td>
    </tr>
  )
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-8 animate-pulse">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-3 gap-6 mt-2">
        <div className="col-span-2 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
type Tab = 'details' | 'boards' | 'pon-ports' | 'vlans' | 'uplink' | 'advanced'

export default function OltDetailPage() {
  const params = useParams<{ id: string }>()
  const oltId  = Number(params.id)
  const router = useRouter()

  const [activeTab,     setActiveTab]     = useState<Tab>('details')
  const [selectedBoard, setSelectedBoard] = useState<BoardItem | null>(null)

  // Add VLAN
  const [openAddVlan,      setOpenAddVlan]      = useState(false)
  const [newVlanId,        setNewVlanId]        = useState('')
  const [newVlanDesc,      setNewVlanDesc]      = useState('')
  const [vlanSaving,       setVlanSaving]       = useState(false)
  const [vlanIsIptv,       setVlanIsIptv]       = useState(false)
  const [vlanIsVoip,       setVlanIsVoip]       = useState(false)
  const [vlanDhcp,         setVlanDhcp]         = useState(false)
  const [vlanLanToLan,     setVlanLanToLan]     = useState(false)
  const [vlanDefaultPon,   setVlanDefaultPon]   = useState('')

  // Uplink
  const [showUplinkInfo, setShowUplinkInfo] = useState(true)

  // PON port config modal
  const [ponConfigPort,    setPonConfigPort]    = useState<PonPortItem | null>(null)
  const [ponForm,          setPonForm]          = useState<{ admin_state: string; description: string; min_range_meters: number; max_range_meters: number }>({ admin_state: 'enabled', description: '', min_range_meters: 0, max_range_meters: 20000 })
  const [ponSaving,        setPonSaving]        = useState(false)
  const [restartPort,      setRestartPort]      = useState<PonPortItem | null>(null)
  const [restarting,       setRestarting]       = useState(false)
  const [restartBoard,     setRestartBoard]     = useState<BoardItem | null>(null)
  const [restartingBoard,  setRestartingBoard]  = useState(false)

  // Uplink config modal
  const [configPort,    setConfigPort]    = useState<UplinkPortItem | null>(null)
  const [uplinkForm,    setUplinkForm]    = useState<Partial<UplinkPortItem>>({})
  const [uplinkSaving,  setUplinkSaving]  = useState(false)
  const [addVlans,      setAddVlans]      = useState('')
  const [removeVlans,   setRemoveVlans]   = useState('')
  const [showUplinkAdvanced, setShowUplinkAdvanced] = useState(false)

  const detailFetcher   = useCallback(() => oltApi.detail(oltId), [oltId])
  const boardsFetcher   = useCallback(() => oltApi.boards(oltId), [oltId])
  const ponPortsFetcher = useCallback(
    () => selectedBoard ? oltApi.ponPorts(selectedBoard.id) : Promise.resolve({ items: [] as PonPortItem[] }),
    [selectedBoard]
  )
  const vlansFetcher    = useCallback(() => settingsApi.vlans(),          [])
  const uplinkFetcher   = useCallback(() => oltApi.uplinkPorts(oltId),   [oltId])
  const allPonFetcher   = useCallback(() => oltApi.allPonPorts(),         [])

  const { data: olt,      loading: loadingOlt                          } = useApi(detailFetcher,   [oltId])
  const { data: boards,   loading: loadingBoards                       } = useApi(boardsFetcher,   [oltId])
  const { data: ponPorts, loading: loadingPonPorts                     } = useApi(ponPortsFetcher, [selectedBoard])
  const { data: vlans,    loading: loadingVlans,  refetch: refetchVlans  } = useApi(vlansFetcher,   [])
  const { data: uplinks,  loading: loadingUplink, refetch: refetchUplink } = useApi(uplinkFetcher,  [oltId])
  const { data: allPons                                                   } = useApi(allPonFetcher,  [])

  function openPonConfig(port: PonPortItem) {
    setPonConfigPort(port)
    setPonForm({
      admin_state:       port.admin_state,
      description:       port.description ?? '',
      min_range_meters:  port.min_range_meters,
      max_range_meters:  port.max_range_meters,
    })
  }

  async function handleSavePonPort() {
    if (!ponConfigPort) return
    setPonSaving(true)
    try {
      await oltApi.updatePonPort(ponConfigPort.id, {
        admin_state:      ponForm.admin_state,
        description:      ponForm.description || undefined,
        min_range_meters: ponForm.min_range_meters,
        max_range_meters: ponForm.max_range_meters,
      })
      // Atualiza localmente sem refetch completo
      setPonConfigPort(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally { setPonSaving(false) }
  }

  async function handleRestartOnus() {
    if (!restartPort) return
    setRestarting(true)
    try {
      await oltApi.restartPonPortOnus(restartPort.id)
      setRestartPort(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao reiniciar.')
    } finally { setRestarting(false) }
  }

  function openConfigPort(port: UplinkPortItem) {
    setConfigPort(port)
    setUplinkForm({
      vlan_mode:    port.vlan_mode,
      tagged_vlans: port.tagged_vlans ?? '',
      description:  port.description ?? '',
      pvid:         port.pvid,
      mtu:          port.mtu,
      duplex:       port.duplex,
      negotiation:  port.negotiation,
    })
    setAddVlans('')
    setRemoveVlans('')
    setShowUplinkAdvanced(false)
  }

  async function handleSaveUplinkPort() {
    if (!configPort) return
    setUplinkSaving(true)
    try {
      // Merge Adicionar VLANs + Remover VLANs na lista tagged_vlans antes de salvar
      let tagged = (uplinkForm.tagged_vlans ?? '')
        .split(',').map(v => v.trim()).filter(Boolean)

      if (addVlans.trim()) {
        const toAdd = addVlans.split(',').map(v => v.trim()).filter(Boolean)
        tagged = Array.from(new Set([...tagged, ...toAdd]))
          .sort((a, b) => Number(a) - Number(b))
      }

      if (removeVlans.trim()) {
        const toRemove = new Set(removeVlans.split(',').map(v => v.trim()))
        tagged = tagged.filter(v => !toRemove.has(v))
      }

      const payload = {
        ...uplinkForm,
        tagged_vlans: tagged.length ? tagged.join(',') : null,
      }

      await oltApi.updateUplinkPort(oltId, configPort.id, payload)
      refetchUplink()
      setConfigPort(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally { setUplinkSaving(false) }
  }

  async function handleDeleteVlan(id: number) {
    if (!window.confirm('Excluir esta VLAN?')) return
    await settingsApi.deleteVlan(id)
    refetchVlans()
  }

  function resetVlanForm() {
    setNewVlanId(''); setNewVlanDesc('')
    setVlanIsIptv(false); setVlanIsVoip(false)
    setVlanDhcp(false);   setVlanLanToLan(false)
    setVlanDefaultPon('')
  }

  async function handleAddVlan() {
    if (!newVlanId) return
    setVlanSaving(true)
    try {
      await settingsApi.createVlan(Number(newVlanId), newVlanDesc || undefined)
      refetchVlans()
      setOpenAddVlan(false)
      resetVlanForm()
    } finally { setVlanSaving(false) }
  }

  if (loadingOlt) return <PageSkeleton />
  if (!olt) return (
    <div className="flex flex-col items-center justify-center gap-4 p-16 text-muted-foreground">
      <AlertTriangle className="h-10 w-10" />
      <p className="text-lg font-medium">OLT não encontrada</p>
      <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
    </div>
  )

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details',   label: 'Detalhes da OLT'        },
    { key: 'boards',    label: 'Cartões OLT'             },
    { key: 'pon-ports', label: 'Portas PON'              },
    { key: 'vlans',     label: 'VLANs'                   },
    { key: 'uplink',    label: 'Uplink'                  },
    { key: 'advanced',  label: 'Avançado'                },
  ]

  return (
    <div className="flex flex-col gap-0 p-8">

      {/* Breadcrumb / title */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="rounded p-1 text-muted-foreground hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground">OLTs</span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-sm font-semibold">{olt.name}</span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b mb-0 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              activeTab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DETALHES tab ── */}
      {activeTab === 'details' && (
        <div className="pt-4 flex flex-col gap-4">

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-black text-white hover:bg-black/80 border-0" onClick={() => router.push(`/olts/${oltId}/edit`)}>
              <Pencil className="h-3.5 w-3.5" /> Editar configurações de OLT
            </Button>
            <Button size="sm" className="bg-black text-white hover:bg-black/80 border-0" onClick={() => router.push(`/olts/${oltId}/history`)}>
              <History className="h-3.5 w-3.5" /> Histórico
            </Button>
            <Button size="sm" className="bg-black text-white hover:bg-black/80 border-0" onClick={() => router.push(`/olts/${oltId}/backups`)}>
              <HardDrive className="h-3.5 w-3.5" /> Backups
            </Button>
          </div>

          {/* Main content: left config + right image */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: config table */}
            <div className="lg:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Configuração OLT
              </div>
              <table className="w-full">
                <tbody>
                  <ConfigRow label="Nome"                                   value={olt.name} />
                  <ConfigRow label="IP OLT"                                 value={<span className="font-mono">{olt.mgmt_ip}</span>} />
                  <ConfigRow label="Localização"                            value={olt.location_name ?? '—'} />
                  <ConfigRow label="Zona"                                   value={olt.zone_name ?? '—'} />
                  <ConfigRow label="Porta TCP Telnet"                       value={<span className="font-mono">{olt.tcp_port ?? 2333}</span>} />
                  <ConfigRow label="Nome de usuário telnet do OLT"          value={olt.telnet_user || '—'} />
                  <ConfigRow label="Senha telnet do OLT"                    value={olt.telnet_password ?? ''} secret />
                  <ConfigRow label="Comunidade SNMP somente leitura"        value={olt.snmp_ro_community ?? '—'} secret />
                  <ConfigRow label="Comunidade SNMP de leitura e gravação"  value={olt.snmp_rw_community ?? '—'} secret />
                  <ConfigRow label="Porta SNMP UDP"                         value={<span className="font-mono">{olt.snmp_udp_port ?? 2161}</span>} />
                  <ConfigRow label="Módulo IPTV"                            value={olt.iptv_enabled ? 'Habilitado' : 'Desabilitado'} />
                  <ConfigRow label="Versão de hardware OLT"                 value={olt.hw_version || '—'} />
                  <ConfigRow label="Módulo de PON suportado"                value={olt.pon_type ?? 'GPON'} />
                  <ConfigRow label="Fabricante"                             value={olt.vendor} />
                  <ConfigRow label="Cadastrado em"                          value={new Date(olt.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })} />
                </tbody>
              </table>
            </div>

            {/* Right: OLT image */}
            <div className="flex flex-col items-center justify-start gap-4">
              <div className="relative w-full max-w-[280px] rounded-xl overflow-hidden border bg-muted/30">
                <Image
                  src={oltImageSrc(olt.vendor)}
                  alt={`${olt.vendor} OLT`}
                  width={280}
                  height={200}
                  className="w-full object-contain"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">{olt.vendor}</p>
                {olt.hw_version && (
                  <p className="text-xs text-muted-foreground">{olt.hw_version}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CARTÕES OLT tab ── */}
      {activeTab === 'boards' && (
        <div className="pt-4">
          {loadingBoards ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : !boards?.items.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum cartão encontrado.</p>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-4 py-2 text-left w-14">Slot</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Terminal</th>
                    <th className="px-4 py-2 text-left">Porta</th>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Papel</th>
                    <th className="px-4 py-2 text-left">Informações do cartão</th>
                    <th className="px-4 py-2 text-left w-40"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {boards.items.map(b => (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{b.slot_index}</td>
                      <td className="px-4 py-3 font-mono text-xs">{b.board_type ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums">{b.terminal_count ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums">{b.pon_port_count}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.board_hw_id ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                          b.board_status === 'Normal'
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-amber-500/10 text-amber-600'
                        )}>
                          {b.board_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{b.board_role}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {new Date(b.updated_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setRestartBoard(b)}
                          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                          Cartão de configuração
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PORTAS PON tab ── */}
      {activeTab === 'pon-ports' && (
        <div className="pt-4 space-y-4">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="bg-black text-white hover:bg-black/80 border-0">Visualizar informações das portas PON</Button>
            <Button size="sm" className="bg-black text-white hover:bg-black/80 border-0">Ativar todas as portas PON</Button>
            <Button size="sm" className="bg-black text-white hover:bg-black/80 border-0">Ativar busca automática</Button>
          </div>

          {loadingBoards ? (
            <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
          ) : !(boards?.items.length) ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum cartão encontrado para esta OLT.</p>
          ) : (
            (boards.items).map(board => {
              const boardPorts = (allPons?.items ?? []).filter(p => p.board_id === board.id)
              return (
                <div key={board.id} className="rounded-xl border overflow-hidden">
                  {/* Título do slot */}
                  <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Slot OLT {board.slot_index}, tipo de placa: {board.board_type ?? board.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setRestartPort({ id: -board.id, name: `Slot ${board.slot_index}`, pon_index: -1, admin_state: 'enabled', description: null, min_range_meters: 0, max_range_meters: 20000, onu_total: 0, onu_online: 0, avg_rx_dbm: null })}
                        className="text-xs text-primary hover:underline"
                      >
                        Reiniciar todas as ONUs no Slot {board.slot_index}
                      </button>
                      <span className="text-xs text-muted-foreground">{boardPorts.length} porta(s)</span>
                    </div>
                  </div>

                  {boardPorts.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground">Nenhuma porta PON encontrada.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[hsl(var(--primary))] text-xs text-white">
                            <th className="px-4 py-2.5 text-left font-medium"></th>
                            <th className="px-4 py-2.5 text-left font-medium">Estado admin.</th>
                            <th className="px-4 py-2.5 text-left font-medium">ONUs</th>
                            <th className="px-4 py-2.5 text-left font-medium">Sinal médio</th>
                            <th className="px-4 py-2.5 text-left font-medium">Descrição</th>
                            <th className="px-4 py-2.5 text-left font-medium">Faixa de transmissão</th>
                            <th className="px-4 py-2.5 text-left font-medium">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {boardPorts.map((p, i) => (
                            <tr key={p.id} className={cn('border-b last:border-0', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium tabular-nums">{p.pon_index}</span>
                                <span className="ml-2 text-xs text-muted-foreground">GPON</span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {p.admin_state === 'enabled' ? 'Habilitado' : 'Desabilitado'}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => router.push(`/onus/configured?pon_port_id=${p.id}&status=online`)}
                                  className="block text-xs text-primary hover:underline font-medium"
                                >
                                  Online: {p.onu_online}
                                </button>
                                <button
                                  onClick={() => router.push(`/onus/configured?pon_port_id=${p.id}`)}
                                  className="block text-xs text-primary hover:underline font-medium"
                                >
                                  Total: {p.onu_total}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-xs tabular-nums">
                                {p.avg_rx_dbm !== null ? `${p.avg_rx_dbm} dBm` : '—'}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{p.description || ''}</td>
                              <td className="px-4 py-3 text-xs tabular-nums">
                                {p.min_range_meters} - {p.max_range_meters} m
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => openPonConfig(p)}
                                  className="block text-xs text-primary hover:underline"
                                >
                                  Configurar
                                </button>
                                <button
                                  onClick={() => setRestartPort(p)}
                                  className="block text-xs text-primary hover:underline mt-0.5"
                                >
                                  Reiniciar ONUs
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })
          )}

          {/* Modal: Configurar porta PON */}
          {ponConfigPort && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-lg rounded-lg bg-white dark:bg-background shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                  <h2 className="text-base font-semibold">Configurar porta PON {ponConfigPort.pon_index}</h2>
                  <button onClick={() => setPonConfigPort(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Form — 2 colunas: label à esquerda, input à direita */}
                <div className="px-6 pb-2 space-y-4">
                  {/* Estado administrativo */}
                  <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
                    <span className="text-sm text-right pt-1 text-foreground">Estado administrativo</span>
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio" name="pon_admin_state" value="enabled"
                          checked={ponForm.admin_state === 'enabled'}
                          onChange={() => setPonForm(f => ({ ...f, admin_state: 'enabled' }))}
                          className="accent-primary"
                        />
                        <span className="text-sm">Habilitado</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio" name="pon_admin_state" value="disabled"
                          checked={ponForm.admin_state === 'disabled'}
                          onChange={() => setPonForm(f => ({ ...f, admin_state: 'disabled' }))}
                          className="accent-primary"
                        />
                        <span className="text-sm">Desabilitado</span>
                      </label>
                    </div>
                  </div>

                  {/* Descrição do porto */}
                  <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
                    <span className="text-sm text-right text-foreground">Descrição do porto</span>
                    <input
                      type="text"
                      value={ponForm.description}
                      onChange={e => setPonForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Intervalo mínimo */}
                  <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
                    <span className="text-sm text-right pt-1.5 text-foreground">Intervalo mínimo</span>
                    <div>
                      <input
                        type="number"
                        value={ponForm.min_range_meters}
                        onChange={e => setPonForm(f => ({ ...f, min_range_meters: Number(e.target.value) }))}
                        className="w-40 rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground mt-1">metros</p>
                    </div>
                  </div>

                  {/* Alcance máximo */}
                  <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
                    <span className="text-sm text-right pt-1.5 text-foreground">Alcance máximo</span>
                    <div>
                      <input
                        type="number"
                        value={ponForm.max_range_meters}
                        onChange={e => setPonForm(f => ({ ...f, max_range_meters: Number(e.target.value) }))}
                        className="w-40 rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground mt-1">metros</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t mt-2">
                  <Button variant="outline" size="sm" onClick={() => setPonConfigPort(null)}>Fechar</Button>
                  <Button size="sm" onClick={handleSavePonPort} disabled={ponSaving}>
                    {ponSaving ? 'Salvando…' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Reiniciar ONUs */}
          {restartPort && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-lg bg-white dark:bg-background shadow-2xl px-6 py-5">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-base font-semibold leading-snug pr-4">
                    Reinicie as ONUs a partir da porta {restartPort.name}.
                  </h2>
                  <button onClick={() => setRestartPort(null)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Tem certeza de que deseja reiniciar todas as ONUs nesta porta PON?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setRestartPort(null)}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
                  >
                    Fechar
                  </button>
                  <Button size="sm" onClick={handleRestartOnus} disabled={restarting}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    {restarting ? 'Reiniciando…' : 'Reiniciar ONUs'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Reiniciar placa OLT — global, visível em qualquer aba */}
      {restartBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-background shadow-2xl px-6 py-5">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-base font-semibold leading-snug pr-4">
                Reinicie a placa OLT
              </h2>
              <button onClick={() => setRestartBoard(null)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Reinicie a placa OLT a partir do slot.{restartBoard.slot_index} ({restartBoard.board_type ?? restartBoard.name}) agora?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRestartBoard(null)}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
              >
                Fechar
              </button>
              <Button
                size="sm"
                disabled={restartingBoard}
                onClick={async () => {
                  setRestartingBoard(true)
                  await new Promise(r => setTimeout(r, 1000))
                  setRestartingBoard(false)
                  setRestartBoard(null)
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {restartingBoard ? 'Reiniciando…' : 'Reiniciar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── VLANs tab ── */}
      {activeTab === 'vlans' && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{vlans?.items.length ?? 0} VLAN(s) cadastradas</span>
            <Button size="sm" onClick={() => setOpenAddVlan(true)}>
              <Plus className="h-3.5 w-3.5" /> Adicionar VLAN
            </Button>
          </div>
          {loadingVlans ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : !vlans?.items.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma VLAN cadastrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left w-24">VLAN</th>
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-right w-24">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vlans.items.map(v => (
                  <tr key={v.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium">{v.vlan_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.description || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteVlan(v.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── UPLINK tab ── */}
      {activeTab === 'uplink' && (
        <div className="pt-4 space-y-3">

          {/* Toggle "Exibir informações das portas de uplink" */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUplinkInfo}
              onChange={e => setShowUplinkInfo(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              Exibir informações das portas de uplink
            </span>
          </label>

          {loadingUplink ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : !uplinks?.items.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma porta uplink encontrada.</p>
          ) : (
            <div className="rounded-xl border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-4 py-2 text-left">Porta de uplink</th>
                    <th className="px-4 py-2 text-left">Fibra</th>
                    <th className="px-4 py-2 text-left">Estado admin.</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Negociação</th>
                    {showUplinkInfo && <>
                      <th className="px-4 py-2 text-left">MTU</th>
                      <th className="px-4 py-2 text-left">Duplex</th>
                      <th className="px-4 py-2 text-left">PVID</th>
                    </>}
                    <th className="px-4 py-2 text-left">Modo VLAN (VLANs marcadas)</th>
                    <th className="px-4 py-2 text-left">Período</th>
                    <th className="px-4 py-2 text-left w-28">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {uplinks.items.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{p.name}</td>
                      <td className="px-4 py-3 text-xs">{p.fiber ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                          p.admin_state === 'Habilitado'
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-muted text-muted-foreground'
                        )}>{p.admin_state}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                          p.status === 'Habilitado'
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-destructive/10 text-destructive'
                        )}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">{p.negotiation}</td>
                      {showUplinkInfo && <>
                        <td className="px-4 py-3 tabular-nums text-xs">{p.mtu ?? '—'}</td>
                        <td className="px-4 py-3 text-xs">{p.duplex}</td>
                        <td className="px-4 py-3 tabular-nums text-xs">{p.pvid}</td>
                      </>}
                      <td className="px-4 py-3 text-xs">
                        {p.tagged_vlans
                          ? `${p.vlan_mode} (${p.tagged_vlans})`
                          : p.vlan_mode}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {new Date(p.updated_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openConfigPort(p)}
                          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          Configurar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── AVANÇADO tab ── */}
      {activeTab === 'advanced' && (
        <div className="pt-4 space-y-4">

          {/* Header com botão editar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Configurações avançadas de operação da OLT</p>
            <Button size="sm" onClick={() => router.push(`/olts/${oltId}/advanced`)}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>

          {/* Tabela key-value */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {[
                  { label: 'Configuração de hardware OLT',                  value: olt.hw_version || '—' },
                  { label: 'Fabricante',                                     value: olt.vendor },
                  { label: 'Módulo de PON suportado',                        value: olt.pon_type },
                  { label: 'Módulo IPTV habilitado',                         value: olt.iptv_enabled ? 'Sim' : 'Não' },
                  { label: 'Backup automático habilitado',                   value: olt.auto_backup_enabled ? 'Sim' : 'Não' },
                  { label: 'Porta TCP Telnet',                               value: String(olt.tcp_port ?? 2333) },
                  { label: 'Porta SNMP UDP',                                 value: String(olt.snmp_udp_port ?? 2161) },
                  { label: 'Nome de usuário Telnet',                         value: olt.telnet_user || '—' },
                  { label: 'Comunidade SNMP somente leitura configurada',    value: olt.snmp_ro_community ? 'Sim' : 'Não' },
                  { label: 'Comunidade SNMP leitura/gravação configurada',   value: olt.snmp_rw_community ? 'Sim' : 'Não' },
                  { label: 'Localização',                                    value: olt.location_name || '—' },
                  { label: 'Zona',                                           value: olt.zone_name || '—' },
                  { label: 'Cadastrado em',                                  value: new Date(olt.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                  { label: 'Última atualização',                             value: new Date(olt.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                ].map(({ label, value }) => (
                  <tr key={label} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground w-1/2">{label}</td>
                    <td className="px-4 py-3 font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Configurar porta uplink */}
      {configPort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold">Configurar porta de uplink {configPort.name}</h2>
              <button onClick={() => setConfigPort(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right">Modo</label>
                <select
                  value={uplinkForm.vlan_mode ?? 'Porta'}
                  onChange={e => setUplinkForm(f => ({ ...f, vlan_mode: e.target.value }))}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {['Porta', 'Tronco', 'Porta-malas', 'Híbrido'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right">VLANs marcadas</label>
                <input
                  value={uplinkForm.tagged_vlans ?? ''}
                  onChange={e => setUplinkForm(f => ({ ...f, tagged_vlans: e.target.value }))}
                  placeholder="Ex: 100,200"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right">Descrição do porto</label>
                <input
                  value={uplinkForm.description ?? ''}
                  onChange={e => setUplinkForm(f => ({ ...f, description: e.target.value }))}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right">Adicionar VLANs</label>
                <input
                  value={addVlans}
                  onChange={e => setAddVlans(e.target.value)}
                  placeholder="Ex: 300,400"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right">Remover VLANs</label>
                <input
                  value={removeVlans}
                  onChange={e => setRemoveVlans(e.target.value)}
                  placeholder="Ex: 100"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowUplinkAdvanced(v => !v)}
                  className="text-xs text-primary hover:underline"
                >
                  Avançado {showUplinkAdvanced ? '▲' : '›'}
                </button>
              </div>

              {showUplinkAdvanced && (
                <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Estado administrativo
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="uplink-admin-state"
                      value="Habilitado"
                      checked={(uplinkForm.admin_state ?? 'Habilitado') === 'Habilitado'}
                      onChange={() => setUplinkForm(f => ({ ...f, admin_state: 'Habilitado' }))}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm">Habilitado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="uplink-admin-state"
                      value="Desabilitado"
                      checked={(uplinkForm.admin_state ?? 'Habilitado') === 'Desabilitado'}
                      onChange={() => setUplinkForm(f => ({ ...f, admin_state: 'Desabilitado' }))}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm">Desativado <span className="text-xs text-muted-foreground">(Porta desligada)</span></span>
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfigPort(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors">
                Fechar
              </button>
              <button
                onClick={handleSaveUplinkPort}
                disabled={uplinkSaving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uplinkSaving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar VLAN */}
      {openAddVlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border bg-card shadow-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Adicionar VLAN</h2>
              <button onClick={() => { setOpenAddVlan(false); resetVlanForm() }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* ID da VLAN */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right">
                  ID da VLAN <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 100"
                  value={newVlanId}
                  onChange={e => setNewVlanId(e.target.value.replace(/\D/g, ''))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Descrição */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right">Descrição</label>
                <input
                  placeholder="Ex: Clientes residenciais"
                  value={newVlanDesc}
                  onChange={e => setNewVlanDesc(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-[160px_1fr] items-start gap-3">
                <div />
                <div className="space-y-2">
                  {[
                    { label: 'VLAN multicast, usada para IPTV',                                                         val: vlanIsIptv,   set: setVlanIsIptv   },
                    { label: 'VLAN de gerenciamento/VoIP',                                                               val: vlanIsVoip,   set: setVlanIsVoip   },
                    { label: 'DHCP Snooping em VLAN',                                                                    val: vlanDhcp,     set: setVlanDhcp     },
                    { label: 'Habilitar a comunicação direta entre ONUs nesta VLAN (também conhecida como LAN para LAN).', val: vlanLanToLan, set: setVlanLanToLan },
                  ].map(({ label, val, set }) => (
                    <label key={label} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={e => set(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0"
                      />
                      <span className="text-sm text-primary leading-snug">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Padrão para portas PON */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground text-right leading-snug">
                  Padrão para portas PON
                </label>
                <select
                  value={vlanDefaultPon}
                  onChange={e => setVlanDefaultPon(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Nenhuma selecionada</option>
                  {(allPons?.items ?? []).map(p => (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Botões */}
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleAddVlan} disabled={!newVlanId || vlanSaving}>
                  {vlanSaving ? 'Salvando…' : 'Salvar'}
                </Button>
                <button
                  onClick={() => { setOpenAddVlan(false); resetVlanForm() }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
