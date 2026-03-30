"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { onuApi, type OnuDetail, type OnuStatus, type OnuTrafficData } from '@/lib/api/onu'
import { oltApi, type OltItem, type BoardItem, type PonPortItem } from '@/lib/api/olt'
import { settingsApi, type ZoneItem } from '@/lib/api/settings'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SelectField } from '@/components/shared/select-field'
import { InfoRow as Info } from '@/components/shared/info-row'
import { ArrowLeft, X, Info as InfoIcon, MoreHorizontal } from 'lucide-react'

function formatXLabel(ts: number, period: 'day'|'week'|'month'|'year'): string {
  const d = new Date(ts)
  if (period === 'day')   return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (period === 'week')  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  if (period === 'month') return `Sem ${Math.ceil(d.getDate() / 7)}`
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function SignalSparkline({
  points,
  height = 60,
  period = 'day',
  showAxes = false,
}: {
  points: { x: number; y: number }[]
  height?: number
  period?: 'day'|'week'|'month'|'year'
  showAxes?: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{ x: number; y: number; px: number; py: number } | null>(null)
  const [viewRange, setViewRange] = useState<{ minX: number; maxX: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const panRef = useRef<{ startX: number; range: { minX: number; maxX: number } } | null>(null)
  // ref so wheel handler always reads latest values without re-registering
  const stateRef = useRef({ effMinX: 0, effMaxX: 0, dataMinX: 0, dataMaxX: 0, plotW: 0, yAxisW: 0, W: 500 })

  // Wheel zoom — registered once, reads stateRef
  // Important: place hooks before any early returns to keep hook order stable
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const { effMinX, effMaxX, dataMinX, dataMaxX, plotW, yAxisW, W } = stateRef.current
      const rect = svg.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, ((e.clientX - rect.left) / rect.width * W - yAxisW) / plotW))
      const cursorX = effMinX + ratio * (effMaxX - effMinX)
      const factor  = e.deltaY > 0 ? 1.35 : 1 / 1.35
      const newRange = (effMaxX - effMinX) * factor
      if (newRange >= dataMaxX - dataMinX) { setViewRange(null); return }
      let lo = cursorX - newRange * ratio
      let hi = cursorX + newRange * (1 - ratio)
      if (lo < dataMinX) { hi = Math.min(dataMaxX, hi + dataMinX - lo); lo = dataMinX }
      if (hi > dataMaxX) { lo = Math.max(dataMinX, lo - (hi - dataMaxX)); hi = dataMaxX }
      setViewRange({ minX: lo, maxX: hi })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  if (!points || points.length === 0) return <div style={{ height }} />

  const W = 500
  const yAxisW = showAxes ? 42 : 4
  const xAxisH = showAxes ? 18 : 4
  const padTop = 6, padRight = 8
  const plotW = W - yAxisW - padRight
  const plotH = height - padTop - xAxisH

  const allXs = points.map(p => p.x)
  const dataMinX = Math.min(...allXs), dataMaxX = Math.max(...allXs)

  const effMinX = viewRange?.minX ?? dataMinX
  const effMaxX = viewRange?.maxX ?? dataMaxX
  const isZoomed = viewRange !== null

  stateRef.current = { effMinX, effMaxX, dataMinX, dataMaxX, plotW, yAxisW, W }

  // Only render points in view (+ 1 neighbour each side for clipping)
  const visPoints = (() => {
    const inView = points.filter(p => p.x >= effMinX && p.x <= effMaxX)
    if (inView.length === 0) return points
    const iFirst = points.indexOf(inView[0])
    const iLast  = points.indexOf(inView[inView.length - 1])
    return points.slice(Math.max(0, iFirst - 1), iLast + 2)
  })()

  const ys = visPoints.map(p => p.y)
  const rawMinY = Math.min(...ys), rawMaxY = Math.max(...ys)
  const yRange  = rawMaxY - rawMinY || 0.1
  const minY    = rawMinY - yRange * 0.1
  const maxY    = rawMaxY + yRange * 0.1

  const sx = (x: number) => yAxisW + ((x - effMinX) / Math.max(1, effMaxX - effMinX)) * plotW
  const sy = (y: number) => padTop + (1 - (y - minY) / (maxY - minY)) * plotH

  const d = visPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ')

  const yTicks = Array.from({ length: 4 }, (_, i) => minY + (maxY - minY) * (i / 3))
  const xTicks = Array.from({ length: 5 }, (_, i) => effMinX + (effMaxX - effMinX) * (i / 4))

  const current = visPoints[visPoints.length - 1]?.y ?? points[points.length - 1]?.y
  const maximum = rawMaxY
  const zoomLevel = Math.round((dataMaxX - dataMinX) / Math.max(1, effMaxX - effMinX))


  const TW = 110, TH = 28

  function screenToDataX(clientX: number): number {
    const svg = svgRef.current!
    const rect = svg.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, ((clientX - rect.left) / rect.width * W - yAxisW) / plotW))
    return effMinX + ratio * (effMaxX - effMinX)
  }

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (e.button !== 0) return
    panRef.current = { startX: e.clientX, range: { minX: effMinX, maxX: effMaxX } }
    setIsPanning(false)
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current; if (!svg) return

    // Pan
    if (panRef.current) {
      const dx = e.clientX - panRef.current.startX
      if (Math.abs(dx) > 3) setIsPanning(true)
      const rect = svg.getBoundingClientRect()
      const dataDx = (dx / rect.width * W / plotW) * (panRef.current.range.maxX - panRef.current.range.minX)
      let lo = panRef.current.range.minX - dataDx
      let hi = panRef.current.range.maxX - dataDx
      if (lo < dataMinX) { hi += dataMinX - lo; lo = dataMinX }
      if (hi > dataMaxX) { lo -= hi - dataMaxX; hi = dataMaxX }
      setViewRange({ minX: lo, maxX: hi })
      return
    }

    // Hover / crosshair
    const rect = svg.getBoundingClientRect()
    const vx = ((e.clientX - rect.left) / rect.width) * W
    let best = visPoints[0]; let bestDist = Infinity
    for (const p of visPoints) {
      const dist = Math.abs(sx(p.x) - vx)
      if (dist < bestDist) { bestDist = dist; best = p }
    }
    if (best) setHover({ x: best.x, y: best.y, px: sx(best.x), py: sy(best.y) })
  }

  function handleMouseUp() {
    panRef.current = null
    setIsPanning(false)
  }

  function handleDoubleClick() {
    setViewRange(null)
  }

  const cursor = isPanning ? 'grabbing' : isZoomed ? 'grab' : 'crosshair'

  return (
    <div className="relative select-none">
      {/* Zoom controls */}
      {showAxes && isZoomed && (
        <div className="absolute top-1 right-1 z-10 flex items-center gap-1">
          <span className="rounded bg-muted/80 px-1.5 py-0.5 text-xs text-muted-foreground">
            {zoomLevel}x
          </span>
          <button
            className="rounded bg-muted/80 px-1.5 py-0.5 text-xs text-primary hover:bg-muted"
            onClick={() => setViewRange(null)}
            title="Resetar zoom (duplo clique)"
          >
            Reset
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        style={{ display: 'block', overflow: 'visible', cursor }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHover(null); panRef.current = null; setIsPanning(false) }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Clip plot area */}
        <defs>
          <clipPath id="plot-clip">
            <rect x={yAxisW} y={padTop} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        {/* Gridlines */}
        {yTicks.map((v, i) => (
          <line key={i}
            x1={yAxisW} y1={sy(v).toFixed(1)}
            x2={W - padRight} y2={sy(v).toFixed(1)}
            stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"
          />
        ))}

        {/* Y axis labels */}
        {showAxes && yTicks.map((v, i) => (
          <text key={i} x={yAxisW - 4} y={sy(v)}
            textAnchor="end" dominantBaseline="middle"
            fontSize="6" fill="currentColor" opacity="0.5"
          >{v.toFixed(1)}</text>
        ))}

        {/* X axis labels */}
        {showAxes && xTicks.map((v, i) => (
          <text key={i} x={sx(v)} y={height - 2}
            textAnchor="middle"
            fontSize="6" fill="currentColor" opacity="0.5"
          >{formatXLabel(v, period)}</text>
        ))}

        {/* Signal line (clipped) */}
        <path d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" clipPath="url(#plot-clip)" />

        {/* Crosshair + tooltip */}
        {hover && !isPanning && (() => {
          const tipX = hover.px + TW + 6 > W ? hover.px - TW - 6 : hover.px + 6
          const tipY = Math.max(padTop, Math.min(hover.py - TH / 2, height - xAxisH - TH))
          return (
            <>
              <line x1={hover.px} y1={padTop} x2={hover.px} y2={height - xAxisH}
                stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 2"
              />
              <circle cx={hover.px} cy={hover.py} r="3.5"
                fill="hsl(var(--primary))" stroke="white" strokeWidth="1.5"
              />
              <rect x={tipX} y={tipY} width={TW} height={TH} rx="3"
                fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth="0.8"
              />
              <text x={tipX + 6} y={tipY + 10} fontSize="6" fill="currentColor" opacity="0.6">
                {formatXLabel(hover.x, period)}
              </text>
              <text x={tipX + 6} y={tipY + 21} fontSize="6" fontWeight="600" fill="currentColor">
                {hover.y.toFixed(2)} dBm
              </text>
            </>
          )
        })()}
      </svg>

      {/* Legend */}
      {showAxes && (
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded" style={{ background: 'hsl(var(--primary))' }} />
            1310nm OLT Rx para ONU
          </span>
          <span>Atual: <strong>{(hover?.y ?? current)?.toFixed(2)} dBm</strong></span>
          <span>Máximo: <strong>{maximum?.toFixed(2)} dBm</strong></span>
          {showAxes && (
            <span className="ml-auto text-xs opacity-50">scroll = zoom · arrastar = pan · duplo clique = reset</span>
          )}
        </div>
      )}
    </div>
  )
}

function TrafficChart({ data }: { data: OnuTrafficData | null }) {
  if (!data || data.items.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">Sem amostras de tráfego.</p>
  }
  const W = 500, H = 120
  const yAxisW = 40, xAxisH = 18, padTop = 6, padRight = 8
  const plotW = W - yAxisW - padRight
  const plotH = H - padTop - xAxisH

  const xs = data.items.map((_, i) => i)
  const rxVals = data.items.map(p => p.rx_mbps ?? 0)
  const txVals = data.items.map(p => p.tx_mbps ?? 0)
  const maxY = Math.max(1, ...rxVals, ...txVals) * 1.1

  const sx = (i: number) => yAxisW + (i / Math.max(1, xs.length - 1)) * plotW
  const sy = (v: number) => padTop + (1 - v / maxY) * plotH

  const rxPath = data.items.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(1)} ${sy(p.rx_mbps ?? 0).toFixed(1)}`).join(' ')
  const txPath = data.items.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(1)} ${sy(p.tx_mbps ?? 0).toFixed(1)}`).join(' ')

  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY]
  const xTicks = [0, Math.floor(xs.length * 0.25), Math.floor(xs.length * 0.5), Math.floor(xs.length * 0.75), xs.length - 1]

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <clipPath id="traffic-clip">
            <rect x={yAxisW} y={padTop} width={plotW} height={plotH} />
          </clipPath>
        </defs>
        {yTicks.map((v, i) => (
          <line key={i} x1={yAxisW} y1={sy(v)} x2={W - padRight} y2={sy(v)} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
        ))}
        {yTicks.map((v, i) => (
          <text key={i} x={yAxisW - 4} y={sy(v)} textAnchor="end" dominantBaseline="middle" fontSize="6" fill="currentColor" opacity="0.5">{v.toFixed(1)}</text>
        ))}
        {xTicks.filter(i => i < data.items.length).map((i, k) => (
          <text key={k} x={sx(i)} y={H - 2} textAnchor="middle" fontSize="6" fill="currentColor" opacity="0.5">
            {new Date(data.items[i].collected_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </text>
        ))}
        <path d={rxPath} fill="none" stroke="#22c55e" strokeWidth="1.5" clipPath="url(#traffic-clip)" />
        <path d={txPath} fill="none" stroke="#3b82f6" strokeWidth="1.5" clipPath="url(#traffic-clip)" />
      </svg>
      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded" style={{ background: '#22c55e' }} />Download</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded" style={{ background: '#3b82f6' }} />Upload</span>
      </div>
    </div>
  )
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.max(0, Math.floor(diff / 60000))
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  return `há ${h} h`
}

// MiniLine removed (graphs)

export default function OnuDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)

  const detail = useApi<OnuDetail>(() => onuApi.detail(id), [id])
  const status = useApi<OnuStatus>(
    () => (detail.status === 200 ? onuApi.status(id) : Promise.resolve({ id, status: '-', admin_state: '-', last_seen_at: null } as OnuStatus)),
    [id, detail.status]
  )
  const running = useApi(
    () => (detail.status === 200 ? onuApi.runningConfig(id) : Promise.resolve({ text: '' })),
    [id, detail.status]
  )
  const swinfo  = useApi(
    () => (detail.status === 200 ? onuApi.softwareInfo(id) : Promise.resolve({ vendor: '', model: '', firmware: '' })),
    [id, detail.status]
  )
  const [signalModalOpen, setSignalModalOpen] = useState(false)
  const [signalPeriod, setSignalPeriod] = useState<'day'|'week'|'month'|'year'>('day')
  const signalSeries = useApi(
    () => (detail.status === 200 ? onuApi.signalHistory(id, { period: signalPeriod, limit: 500 }) : Promise.resolve({ items: [] })),
    [id, detail.status, signalPeriod]
  )
  const olts = useApi(() => oltApi.list({ page_size: 1000 }))
  const boards = useApi(() => oltApi.allBoards(), [])
  const ports = useApi(() => oltApi.allPonPorts(), [])
  const zones = useApi(() => settingsApi.zones(), [])
  const vlans = useApi(() => settingsApi.vlans(), [])
  const ethPorts = useApi(() => (detail.status === 200 ? onuApi.ethernetPorts(id) : Promise.resolve({ items: [] })), [id, detail.status])
  const events = useApi(() => (detail.status === 200 ? onuApi.events(id, 5) : Promise.resolve({ items: [] })), [id, detail.status])
  const traffic = useApi<OnuTrafficData>(
    () => (detail.status === 200 ? onuApi.traffic(id, 60) : Promise.resolve({ items: [], stats: { rx_max: null, tx_max: null, rx_avg: null, tx_avg: null } })),
    [id, detail.status]
  )

  const [live, setLive] = useState(false)
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => {
      status.refetch()
      detail.refetch()
      signalSeries.refetch()
      traffic.refetch()
    }, 5000)
    return () => clearInterval(t)
  }, [live])

  

  // Simple Modal
  function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10 w-full max-w-xl rounded-lg border bg-popover p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{title}</h3>
            <Button aria-label="Fechar" variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  // Info e SelectField agora são componentes compartilhados

  // Dialog states
  const [openMove, setOpenMove] = useState(false)
  const [openOnuIndex, setOpenOnuIndex] = useState(false)
  const [openChannel, setOpenChannel] = useState(false)
  const [openReplaceSn, setOpenReplaceSn] = useState(false)
  const [openOnuType, setOpenOnuType] = useState(false)
  const [openLocation, setOpenLocation] = useState(false)
  const [openExternalId, setOpenExternalId] = useState(false)
  const [openVlans, setOpenVlans] = useState(false)
  const [openMode, setOpenMode] = useState(false)
  const [openTr069, setOpenTr069] = useState(false)
  const [openRunCfg, setOpenRunCfg] = useState(false)
  const [openSwInfo, setOpenSwInfo] = useState(false)
  const [openStatus, setOpenStatus] = useState(false)
  const [openLive, setOpenLive] = useState(false)
  const [openServicePort, setOpenServicePort] = useState(false)
  const [openEth, setOpenEth] = useState(false)
  const [openHistory, setOpenHistory] = useState(false)

  // Local form states
  const [selOlt, setSelOlt] = useState<number | null>(null)
  const [selBoard, setSelBoard] = useState<number | null>(null)
  const [selPort, setSelPort] = useState<number | null>(null)
  const [targetOnuIndex, setTargetOnuIndex] = useState<number | ''>('')
  const [selPonType, setSelPonType] = useState<string>('GPON')
  const [newSn, setNewSn] = useState('')
  const [selOnuType, setSelOnuType] = useState<number | null>(null)
  const [locName, setLocName] = useState('')
  const [locAddress, setLocAddress] = useState('')
  const [locContact, setLocContact] = useState('')
  const [locLat, setLocLat] = useState<string>('')
  const [locLng, setLocLng] = useState<string>('')
  const [selOdb, setSelOdb] = useState<number | null>(null)
  const [selZone, setSelZone] = useState<number | null>(null)
  const [selOdbPort, setSelOdbPort] = useState<number | null>(null)
  const [externalId, setExternalId] = useState('')
  const [selVlan, setSelVlan] = useState<number | ''>('')
  const [selMode, setSelMode] = useState<string>('bridge')
  const [tr069Enabled, setTr069Enabled] = useState(false)
  const [mgmtMode, setMgmtMode] = useState<'inactive'|'static'|'dhcp'>('inactive')
  const [mgmtIp, setMgmtIp] = useState('')
  const [tr069Profile, setTr069Profile] = useState<number | null>(null)
  const [servicePortId, setServicePortId] = useState<string>('')
  const [serviceVlan, setServiceVlan] = useState<number | ''>('')
  const [serviceDlId, setServiceDlId] = useState<number | null>(null)
  const [serviceUlId, setServiceUlId] = useState<number | null>(null)
  const [ethDraft, setEthDraft] = useState<{ id: number; admin_state: string; mode: string; vlan_id: number | null; dhcp_mode: string | null } | null>(null)

  useEffect(() => {
    if (!detail.data) return
    const d = detail.data as any
    // Mover ONU
    setSelOlt(d.olt_id)
    setSelBoard(d.board_id ?? null)
    setSelPort(d.pon_port_id ?? null)
    // ONU index
    setTargetOnuIndex(d.onu_index ?? '')
    // Canal GPON
    setSelPonType(d.pon_type ?? 'GPON')
    // Substituir SN
    setNewSn(d.serial_number ?? '')
    // Localização
    setSelZone(d.zone_id ?? null)
    setLocName(d.name ?? '')
    setLocAddress(d.address ?? '')
    setLocContact(d.contact ?? '')
    setLocLat(d.latitude != null ? String(d.latitude) : '')
    setLocLng(d.longitude != null ? String(d.longitude) : '')
    // ID externo
    setExternalId(d.external_id ?? '')
    // VLANs / Modo
    setSelVlan(d.vlan_id ?? '')
    setSelMode(d.mode ?? 'bridge')
    // Serviço / perfis
    setServicePortId(String(d.service_port_id ?? ''))
    setServiceVlan(d.vlan_id ?? '')
    // TR-069 / Gestão IP
    setMgmtMode(d.mgmt_ip ? 'static' : d.tr069_enabled ? 'dhcp' : 'inactive')
    setMgmtIp(d.mgmt_ip ?? '')
  }, [detail.data])

  if (Number.isNaN(id)) return <div className="p-8">ID inválido.</div>

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Detalhe da ONU</h1>
      </div>

      {detail.status === 404 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">ONU não encontrada</h2>
          <p className="text-sm text-muted-foreground">Verifique o ID informado e tente novamente.</p>
        </div>
      )}

      {/* Header removido para seguir layout solicitado (sem cards no topo) */}

      {/* Info grid em duas colunas, sem cards (inlines) */}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Info label="OLT" value={detail.data?.olt_name} onClick={() => setOpenMove(true)} />
          <Info label="Quadro" value={detail.data ? `${detail.data.board_name} (slot ${detail.data.board_slot_index})` : '—'} onClick={() => setOpenMove(true)} />
          <Info label="Porta" value={detail.data?.pon_port_name} onClick={() => setOpenMove(true)} />
          <Info label="ONU" value={String((detail.data as any)?.onu_index ?? '') || '—'} onClick={() => setOpenOnuIndex(true)} />
          <Info label="Canal GPON" value={(detail.data as any)?.pon_type ?? '—'} onClick={() => setOpenChannel(true)} />
          <Info label="SN" value={detail.data?.serial_number} onClick={() => setOpenReplaceSn(true)} />
          <Info label="Tipo ONU" value={detail.data ? `${detail.data.onu_vendor ?? '—'} ${detail.data.onu_model ?? ''}` : '—'} onClick={() => setOpenOnuType(true)} />
          <Info label="Zona" value={detail.data?.zone_name ?? '—'} onClick={() => setOpenLocation(true)} />
          <Info label="ODB (Divisor)" value={detail.data?.odb_name ?? '—'} onClick={() => setOpenLocation(true)} />
          <Info label="Nome" value={detail.data?.name ?? '—'} onClick={() => setOpenLocation(true)} />
          <Info label="Endereço ou comentário" value={detail.data?.address ?? '—'} onClick={() => setOpenLocation(true)} />
          <Info label="Contato" value={detail.data?.contact ?? '—'} onClick={() => setOpenLocation(true)} />
          <Info label="Data de autorização" value={detail.data ? new Date(detail.data.created_at).toLocaleString('pt-BR') : '—'} />
          <Info label="Histórico" value="Ver eventos" onClick={() => setOpenHistory(true)} />
          <Info label="ID externo da ONU" value={detail.data?.external_id ?? '—'} onClick={() => setOpenExternalId(true)} />
        </div>
        <div>
          <Info label="Status" value={`On-line ${status.data ? relativeTime(status.data.last_seen_at) : '—'}`} />
          <Info label="Sinal de recepção ONU" value={`${detail.data?.last_known_signal ?? 'N/D'} dBm`} />
          <Info label="VLANs anexadas" value={detail.data?.vlan_id ?? '—'} onClick={() => setOpenVlans(true)} />
          <Info label="Modo ONU" value={detail.data?.mode ?? '—'} onClick={() => setOpenMode(true)} />
          <Info label="TR069" value={detail.data?.tr069_enabled === true ? 'Ativo' : detail.data?.tr069_enabled === false ? 'Inativo' : '—'} onClick={() => setOpenTr069(true)} />
          <Info label="Gestão de IP" value={detail.data?.mgmt_ip ?? 'Inativo'} onClick={() => setOpenTr069(true)} />
        </div>
      </div>

      {/* Linha de CTAs (status) */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">Status:</span>
        <Button variant="default" size="sm" onClick={() => { status.refetch(); detail.refetch(); setOpenStatus(true) }}>
          {status.loading ? 'Obtendo…' : 'Obter Status'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => { running.refetch(); setOpenRunCfg(true) }}>
          Exibir Configurações em execução
        </Button>
        <Button variant="secondary" size="sm" onClick={() => { swinfo.refetch(); setOpenSwInfo(true) }}>
          Informações SW
        </Button>
        <Button variant={live ? 'default' : 'secondary'} size="sm" onClick={() => { setLive(v => !v); traffic.refetch(); setOpenLive(true) }}>AO VIVO</Button>
      </div>

      {/* Gráfico de sinal (Recepção) */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sinal óptico (Recepção)</h2>
          <button className="p-1 rounded hover:bg-muted" title="Ver mais" onClick={() => setSignalModalOpen(true)}>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <SignalSparkline points={(signalSeries.data?.items ?? []).map(p => ({ x: new Date(p.ts).getTime(), y: p.value }))} height={80} period={signalPeriod} showAxes />
      </div>

      {/* Perfis de velocidade */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-2">Perfis de velocidade</h2>
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(var(--primary))] text-xs">
                <th className="px-3 py-2.5 text-left !text-white">ID da porta de serviço</th>
                <th className="px-3 py-2.5 text-left !text-white">VLAN do Usuário</th>
                <th className="px-3 py-2.5 text-left !text-white">Download</th>
                <th className="px-3 py-2.5 text-left !text-white">Upload</th>
              </tr>
            </thead>
            <tbody className="table-row h-2" aria-hidden="true"></tbody>
            <tbody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
              <tr className="odd:bg-[hsl(var(--secondary))]/20 odd:hover:bg-[hsl(var(--secondary))]/20 border-none hover:bg-transparent">
                <td className="px-3 py-2.5">{detail.data?.service_port_id ?? '—'}</td>
                <td className="px-3 py-2.5">{detail.data?.vlan_id ?? '—'}</td>
                <td className="px-3 py-2.5">{detail.data?.download_profile ?? '—'}</td>
                <td className="px-3 py-2.5">{detail.data?.upload_profile ?? '—'}</td>
              </tr>
            </tbody>
            <tbody className="table-row h-2" aria-hidden="true"></tbody>
          </table>
        </div>
      </div>

      {/* Portas Ethernet */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-2">Portas Ethernet</h2>
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(var(--primary))] text-xs">
                <th className="px-3 py-2.5 text-left !text-white">Porta</th>
                <th className="px-3 py-2.5 text-left !text-white">Estado administrativo</th>
                <th className="px-3 py-2.5 text-left !text-white">Modo</th>
                <th className="px-3 py-2.5 text-left !text-white">DHCP</th>
              </tr>
            </thead>
            <tbody className="table-row h-2" aria-hidden="true"></tbody>
            <tbody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
              {(ethPorts.data?.items ?? []).map(p => (
                <tr key={p.id} className="odd:bg-[hsl(var(--secondary))]/20 odd:hover:bg-[hsl(var(--secondary))]/20 border-none hover:bg-transparent">
                  <td className="px-3 py-2.5">{p.port_name}</td>
                  <td className="px-3 py-2.5">{p.admin_state}</td>
                  <td className="px-3 py-2.5">{p.mode}{p.vlan_id ? ` (VLAN ${p.vlan_id})` : ''}</td>
                  <td className="px-3 py-2.5">{p.dhcp_mode ?? 'Sem controle'}</td>
                </tr>
              ))}
              {((ethPorts.data?.items ?? []).length === 0) && (
                <tr className="odd:bg-[hsl(var(--secondary))]/20 odd:hover:bg-[hsl(var(--secondary))]/20 border-none hover:bg-transparent"><td className="px-3 py-4 text-xs text-muted-foreground" colSpan={4}>Nenhuma porta cadastrada.</td></tr>
              )}
            </tbody>
            <tbody className="table-row h-2" aria-hidden="true"></tbody>
          </table>
        </div>
      </div>

      {/* CTAs inferiores */}
      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm" onClick={async () => {
          if (!window.confirm('Reiniciar a ONU? Ela ficará offline por alguns segundos.')) return
          await onuApi.resync(id); status.refetch()
        }}>Reinício</Button>
        <Button variant="secondary" size="sm" onClick={async () => { await onuApi.resync(id); status.refetch() }}>Ressincronizar configuração</Button>
        <Button variant="secondary" size="sm" onClick={async () => {
          if (!window.confirm('Restaurar configurações de fábrica? Esta ação não pode ser desfeita.')) return
          await onuApi.resync(id); detail.refetch(); status.refetch()
        }}>Restaurar padrões</Button>
        <Button variant="destructive" size="sm" onClick={async () => {
          if (!window.confirm('Desativar esta ONU?')) return
          await onuApi.disable(id); status.refetch()
        }}>Desativar ONU</Button>
      </div>

      {/* Modal Histórico */}
      <Modal open={openHistory} title="Histórico de eventos" onClose={() => setOpenHistory(false)}>
        {events.loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !events.data?.items.length ? (
          <p className="text-sm text-muted-foreground">Nenhum evento registrado para esta ONU.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 text-left font-medium">Ação</th>
                <th className="py-2 text-left font-medium">Usuário</th>
                <th className="py-2 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {events.data.items.map(ev => (
                <tr key={ev.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{ev.event_type}</td>
                  <td className="py-2 pr-4 text-muted-foreground">Sistema</td>
                  <td className="py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(ev.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-4 flex items-center justify-between">
          <button className="text-xs text-primary hover:underline">Ver todo o histórico →</button>
          <Button size="sm" variant="outline" onClick={() => setOpenHistory(false)}>Fechar</Button>
        </div>
      </Modal>

      {/* Modals */}
      <Modal open={signalModalOpen} title="Evolução do sinal (Recepção)" onClose={() => setSignalModalOpen(false)}>
        <div className="flex items-center gap-2 mb-3">
          {(['day','week','month','year'] as const).map(p => (
            <button key={p}
              className={cn('text-xs rounded px-2 py-1 border', signalPeriod===p ? 'border-primary text-primary' : 'border-input text-muted-foreground hover:bg-muted')}
              onClick={() => setSignalPeriod(p)}
            >{p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}</button>
          ))}
        </div>
        <div className="border rounded p-2">
          <SignalSparkline points={(signalSeries.data?.items ?? []).map(p => ({ x: new Date(p.ts).getTime(), y: p.value }))} height={200} period={signalPeriod} showAxes />
        </div>
        {signalSeries.loading && <p className="mt-2 text-xs text-muted-foreground">Carregando…</p>}
        <div className="mt-3 flex justify-end"><Button size="sm" variant="outline" onClick={() => setSignalModalOpen(false)}>Fechar</Button></div>
      </Modal>
      <Modal open={openMove} title="Mover ONU" onClose={() => setOpenMove(false)}>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">OLT</label>
          <SelectField valueId={selOlt} onChange={setSelOlt} options={(olts.data?.items ?? []).map((o: OltItem) => ({ id: o.id, name: o.name }))} />
          <label className="text-xs text-muted-foreground">Quadro</label>
          <SelectField valueId={selBoard} onChange={setSelBoard} options={(boards.data?.items ?? []).map((b: BoardItem) => ({ id: b.id, name: b.name }))} />
          <label className="text-xs text-muted-foreground">Porta</label>
          <SelectField valueId={selPort} onChange={setSelPort} options={(ports.data?.items ?? []).map((p: PonPortItem) => ({ id: p.id, name: p.name }))} />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenMove(false)}>Cancelar</Button>
            <Button size="sm" onClick={async () => {
              await onuApi.update(id, { olt_id: selOlt!, board_id: selBoard!, pon_port_id: selPort! })
              setOpenMove(false); detail.refetch()
            }}>Mover</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Configurar ID da porta de serviço */}
      <Modal open={openServicePort} title="Configurar ID da porta de serviço" onClose={() => setOpenServicePort(false)}>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">ID da porta de serviço</label>
          <input className="h-9 rounded border px-2" value={servicePortId} onChange={e => setServicePortId(e.target.value)} />
          <label className="text-xs text-muted-foreground">VLAN do usuário</label>
          <SelectField valueId={(serviceVlan as any as number) || null} onChange={(v) => setServiceVlan((v ?? '') as any)} options={(vlans.data?.items ?? []).map(v => ({ id: v.vlan_id, name: String(v.vlan_id)}))} />
          <label className="text-xs text-muted-foreground">Velocidade de download</label>
          <input className="h-9 rounded border px-2" value={serviceDlId ?? ''} onChange={e => setServiceDlId(e.target.value ? Number(e.target.value) : null)} placeholder="Mbps (texto livre)" />
          <label className="text-xs text-muted-foreground">Velocidade de upload</label>
          <input className="h-9 rounded border px-2" value={serviceUlId ?? ''} onChange={e => setServiceUlId(e.target.value ? Number(e.target.value) : null)} placeholder="Mbps (texto livre)" />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenServicePort(false)}>Fechar</Button>
            <Button size="sm" onClick={async () => {
              await onuApi.update(id, {
                service_port_id: servicePortId ? Number(servicePortId) : null,
                vlan_id: serviceVlan === '' ? null : Number(serviceVlan),
                download_profile: serviceDlId != null ? String(serviceDlId) : null,
                upload_profile:   serviceUlId != null ? String(serviceUlId) : null,
              })
              setOpenServicePort(false); detail.refetch()
            }}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Configurar porta ethernet */}
      <Modal open={openEth} title="Configurar porta ethernet" onClose={() => setOpenEth(false)}>
        {ethDraft && (
          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">Porta: {ethDraft.id}</div>
            <label className="text-xs text-muted-foreground">Status</label>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="eth_admin" checked={ethDraft.admin_state==='enabled'} onChange={()=> setEthDraft({ ...ethDraft, admin_state: 'enabled' })} /> Habilitado</label>
              <label className="flex items-center gap-2"><input type="radio" name="eth_admin" checked={ethDraft.admin_state==='disabled'} onChange={()=> setEthDraft({ ...ethDraft, admin_state: 'disabled' })} /> Fechado</label>
            </div>
            <label className="text-xs text-muted-foreground">Modo</label>
            <div className="flex items-center gap-3 text-sm">
              {['access','hybrid','trunk','transparent'].map(m => (
                <label key={m} className="flex items-center gap-2"><input type="radio" name="eth_mode" checked={ethDraft.mode===m} onChange={()=> setEthDraft({ ...ethDraft, mode: m })} /> {m}</label>
              ))}
            </div>
            <label className="text-xs text-muted-foreground">ID da VLAN</label>
            <SelectField valueId={(ethDraft.vlan_id as any as number) || null} onChange={(v)=> setEthDraft({ ...ethDraft, vlan_id: v })} options={(vlans.data?.items ?? []).map(v => ({ id: v.vlan_id, name: String(v.vlan_id)}))} />
            <label className="text-xs text-muted-foreground">DHCP</label>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="eth_dhcp" checked={!ethDraft.dhcp_mode} onChange={()=> setEthDraft({ ...ethDraft, dhcp_mode: null })} /> Sem controle</label>
              <label className="flex items-center gap-2"><input type="radio" name="eth_dhcp" checked={ethDraft.dhcp_mode==='dhcp'} onChange={()=> setEthDraft({ ...ethDraft, dhcp_mode: 'dhcp' })} /> DHCP</label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpenEth(false)}>Fechar</Button>
              <Button size="sm" onClick={async () => {
                await onuApi.updateEthernetPort(id, ethDraft.id, {
                  admin_state: ethDraft.admin_state,
                  mode: ethDraft.mode,
                  vlan_id: ethDraft.vlan_id ?? null,
                  dhcp_mode: ethDraft.dhcp_mode ?? null,
                })
                setOpenEth(false); ethPorts.refetch()
              }}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={openOnuIndex} title="Alterar ID ONU alocado" onClose={() => setOpenOnuIndex(false)}>
        <p className="text-xs text-muted-foreground mb-2">Esta ação moverá a ONU para um ID diferente na mesma placa/porta.</p>
        <div className="flex items-center gap-2">
          <input className="h-9 w-32 rounded border px-2" placeholder="Novo ID" value={targetOnuIndex} onChange={e => setTargetOnuIndex(e.target.value === '' ? '' : Number(e.target.value))} />
          <Button size="sm" onClick={async () => { await onuApi.update(id, { onu_index: targetOnuIndex === '' ? null : Number(targetOnuIndex) }); setOpenOnuIndex(false); detail.refetch() }}>Aplicar</Button>
        </div>
      </Modal>

      <Modal open={openChannel} title="Atualizar canal GPON" onClose={() => setOpenChannel(false)}>
        <div className="flex gap-4 text-sm">
          {['GPON','XG-PON','XGS-PON'].map(s => (
            <label key={s} className="flex items-center gap-2">
              <input type="radio" name="pon_type" checked={selPonType===s} onChange={() => setSelPonType(s)} /> {s}
            </label>
          ))}
        </div>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground flex items-start gap-2">
          <InfoIcon className="h-4 w-4 mt-0.5" />
          <div>
            <p>O sistema aloca IDs de ONU no intervalo de 0 a 127 para o canal GPON e no intervalo de 128 a 255 para os canais XG/XGS-PON.</p>
            <p>Quando o intervalo de 128-255 estiver esgotado, serão alocados canais do intervalo de 0-127, tanto para GPON quanto para XG/XGS-PON.</p>
            <p>Dica: ONUs compatíveis com XGPON que foram previamente autorizadas no canal GPON devem ser alteradas para o canal XGPON para liberar IDs para as ONUs GPON.</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpenChannel(false)}>Fechar</Button>
          <Button size="sm" onClick={async () => { await onuApi.update(id, { pon_type: selPonType }); setOpenChannel(false); detail.refetch() }}>Atualizar</Button>
        </div>
      </Modal>

      <Modal open={openReplaceSn} title="Substituir ONU por SN" onClose={() => setOpenReplaceSn(false)}>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">SN</label>
          <input className="h-9 rounded border px-2" placeholder="Serial Number" value={newSn} onChange={e => setNewSn(e.target.value)} />
          {/* Tipo ONU removido da lista de settings */}
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenReplaceSn(false)}>Fechar</Button>
            <Button size="sm" onClick={async () => { await onuApi.update(id, { serial_number: newSn || undefined, onu_type_id: selOnuType ?? undefined }); setOpenReplaceSn(false); detail.refetch() }}>Substituir</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openOnuType} title="Alterar tipo de ONU" onClose={() => setOpenOnuType(false)}>
        {/* Tipo ONU removido da lista de settings */}
        <label className="text-xs text-muted-foreground mt-2">Perfil personalizado</label>
        <SelectField valueId={null} onChange={() => {}} options={[]} placeholder="Selecione (placeholder)" />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpenOnuType(false)}>Fechar</Button>
          <Button size="sm" onClick={async () => { await onuApi.update(id, { onu_type_id: selOnuType ?? null }); setOpenOnuType(false); detail.refetch() }}>Mudar</Button>
        </div>
      </Modal>

      <Modal open={openLocation} title="Atualizar detalhes de localização" onClose={() => setOpenLocation(false)}>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Zona</label>
          <SelectField valueId={selZone} onChange={setSelZone} options={(zones.data?.items ?? []).map((z: ZoneItem) => ({ id: z.id, name: z.name }))} />
          {/* ODB (Divisor) removido da lista de settings */}
          <label className="text-xs text-muted-foreground">Porta ODB</label>
          <SelectField valueId={selOdbPort} onChange={setSelOdbPort} options={Array.from({ length: 16 }, (_, i) => ({ id: i + 1, name: String(i + 1) }))} />
          <label className="text-xs text-muted-foreground">Nome</label>
          <input className="h-9 rounded border px-2" value={locName} onChange={e => setLocName(e.target.value)} placeholder="Cliente / Local" />
          <label className="text-xs text-muted-foreground">Endereço / Comentário</label>
          <input className="h-9 rounded border px-2" value={locAddress} onChange={e => setLocAddress(e.target.value)} placeholder="Endereço ou comentário" />
          <label className="text-xs text-muted-foreground">Contato</label>
          <input className="h-9 rounded border px-2" value={locContact} onChange={e => setLocContact(e.target.value)} placeholder="Contato" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Latitude</label>
              <input className="h-9 w-full rounded border px-2" value={locLat} onChange={e => setLocLat(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Longitude</label>
              <input className="h-9 w-full rounded border px-2" value={locLng} onChange={e => setLocLng(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenLocation(false)}>Fechar</Button>
            <Button size="sm" onClick={async () => {
              await onuApi.update(id, {
                odb_id: selOdb ?? null,
                zone_id: selZone ?? null,
                odb_port: selOdbPort ? String(selOdbPort) : null,
                name: locName || null,
                address: locAddress || null,
                contact: locContact || null,
                latitude: locLat ? Number(locLat) : null,
                longitude: locLng ? Number(locLng) : null,
              })
              setOpenLocation(false); detail.refetch()
            }}>Atualizar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openExternalId} title="Atualizar ID externo" onClose={() => setOpenExternalId(false)}>
        <div className="flex items-center gap-2">
          <input className="h-9 rounded border px-2" placeholder="ID externo" value={externalId} onChange={e => setExternalId(e.target.value)} />
          <Button size="sm" onClick={async () => { await onuApi.update(id, { external_id: externalId || null }); setOpenExternalId(false); detail.refetch() }}>Atualizar</Button>
        </div>
      </Modal>

      <Modal open={openVlans} title="Atualizar VLANs" onClose={() => setOpenVlans(false)}>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">VLAN</label>
          <SelectField valueId={selVlan as any as number || null} onChange={(v) => setSelVlan((v ?? '') as any)} options={(vlans.data?.items ?? []).map(v => ({ id: v.vlan_id, name: String(v.vlan_id)}))} />
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <InfoIcon className="h-4 w-4 mt-0.5" />
            <div>
              <p>Selecione na lista todas as VLANs que serão usadas nesta ONU.</p>
              <p>Após alterar a lista de VLANs, acesse as configurações das portas Ethernet e atribua as VLANs conforme desejado.</p>
            </div>
          </div>
          <div className="mt-2 flex justify-end"><Button size="sm" onClick={async () => { await onuApi.update(id, { vlan_id: selVlan === '' ? null : Number(selVlan) }); setOpenVlans(false); detail.refetch() }}>Atualizar</Button></div>
        </div>
      </Modal>

      <Modal open={openMode} title="Atualizar modo ONU" onClose={() => setOpenMode(false)}>
        <div className="grid gap-2">
          <div className="flex gap-4 text-sm">
            {['bridge','router'].map(m => (
              <label key={m} className="flex items-center gap-2"><input type="radio" name="mode" checked={selMode===m} onChange={() => setSelMode(m)} /> {m.toUpperCase()}</label>
            ))}
          </div>
          <label className="text-xs text-muted-foreground">VLAN</label>
          <SelectField valueId={selVlan as any as number || null} onChange={(v) => setSelVlan((v ?? '') as any)} options={(vlans.data?.items ?? []).map(v => ({ id: v.vlan_id, name: String(v.vlan_id)}))} />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenMode(false)}>Fechar</Button>
            <Button size="sm" onClick={async () => { await onuApi.update(id, { mode: selMode, vlan_id: selVlan === '' ? null : Number(selVlan) }); setOpenMode(false); detail.refetch() }}>Atualizar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openTr069} title="Gerenciamento de atualizações e VoIP IP" onClose={() => setOpenTr069(false)}>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Perfil TR-069</label>
          <SelectField valueId={tr069Profile} onChange={setTr069Profile} options={[{id:1,name:'Default'},{id:2,name:'ISP-A'},{id:3,name:'ISP-B'}]} />
          <label className="text-xs text-muted-foreground">Gestão de IP</label>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="radio" name="mgmt" checked={mgmtMode==='inactive'} onChange={()=>setMgmtMode('inactive')} /> Inativo</label>
            <label className="flex items-center gap-2"><input type="radio" name="mgmt" checked={mgmtMode==='static'} onChange={()=>setMgmtMode('static')} /> IP estático</label>
            <label className="flex items-center gap-2"><input type="radio" name="mgmt" checked={mgmtMode==='dhcp'} onChange={()=>setMgmtMode('dhcp')} /> DHCP</label>
          </div>
          {mgmtMode==='static' && (
            <input className="h-9 rounded border px-2" placeholder="IP" value={mgmtIp} onChange={e => setMgmtIp(e.target.value)} />
          )}
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenTr069(false)}>Fechar</Button>
            <Button size="sm" onClick={async () => { await onuApi.update(id, { tr069_enabled: mgmtMode!=='inactive', tr069_profile: tr069Profile ? (tr069Profile===1?'Default':tr069Profile===2?'ISP-A':'ISP-B') : null, mgmt_ip: mgmtMode==='static' ? (mgmtIp || null) : null }); setOpenTr069(false); detail.refetch() }}>Atualizar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openRunCfg} title="Configuração em execução" onClose={() => setOpenRunCfg(false)}>
        {running.loading
          ? <p className="text-xs text-muted-foreground">Carregando…</p>
          : running.error
            ? <p className="text-xs text-destructive">{running.error}</p>
            : <pre className="text-xs bg-muted p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">{(running as any).data?.text || '(sem configuração)'}</pre>
        }
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setOpenRunCfg(false)}>Fechar</Button>
        </div>
      </Modal>

      <Modal open={openSwInfo} title="Informações de software" onClose={() => setOpenSwInfo(false)}>
        {swinfo.loading
          ? <p className="text-sm text-muted-foreground">Carregando…</p>
          : swinfo.error
            ? <p className="text-sm text-destructive">{swinfo.error}</p>
            : (
              <div className="grid gap-0 text-sm">
                {[
                  ['Fabricante', (swinfo as any).data?.vendor],
                  ['Modelo', (swinfo as any).data?.model],
                  ['Firmware', (swinfo as any).data?.firmware ?? 'Requer CLI OLT'],
                  ['Serial Number', (swinfo as any).data?.serial_number],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between border-b last:border-0 py-1.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val || '—'}</span>
                  </div>
                ))}
              </div>
            )
        }
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setOpenSwInfo(false)}>Fechar</Button>
        </div>
      </Modal>

      {/* Modal: Obter Status */}
      <Modal open={openStatus} title="Status da ONU" onClose={() => setOpenStatus(false)}>
        {status.loading
          ? <p className="text-sm text-muted-foreground">Carregando…</p>
          : status.error
            ? <p className="text-sm text-destructive">{status.error}</p>
            : (() => {
                const s = status.data as OnuStatus | null
                if (!s) return <p className="text-sm text-muted-foreground">Sem dados.</p>
                return (
                  <div className="grid gap-4 text-sm">
                    {/* Estado óptico */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Estado óptico</h4>
                      <div className="grid gap-0">
                        {[
                          ['RX Power (OLT → ONU)', s.rx_dbm != null ? `${s.rx_dbm.toFixed(2)} dBm` : '—'],
                          ['TX Power (ONU → OLT)', s.tx_dbm != null ? `${s.tx_dbm.toFixed(2)} dBm` : 'Requer CLI OLT'],
                          ['Temperatura', 'Requer CLI OLT'],
                          ['Distância', 'Requer CLI OLT'],
                          ['Última medição', s.signal_ts ? new Date(s.signal_ts).toLocaleString('pt-BR') : '—'],
                        ].map(([label, val]) => (
                          <div key={label as string} className="flex justify-between border-b last:border-0 py-1">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Detalhes da ONU */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Detalhes da ONU</h4>
                      <div className="grid gap-0">
                        {[
                          ['Status', s.status],
                          ['Admin State', s.admin_state],
                          ['Serial Number', s.serial_number],
                          ['Nome', s.name],
                          ['IP de gestão', s.mgmt_ip ?? 'Inativo'],
                          ['Modo', s.mode],
                          ['VLAN', s.vlan_id != null ? String(s.vlan_id) : '—'],
                          ['TR-069', s.tr069_enabled ? 'Ativo' : 'Inativo'],
                          ['CATV', s.catv_enabled ? 'Ativo' : 'Inativo'],
                          ['VoIP', s.voip_enabled ? 'Ativo' : 'Inativo'],
                          ['Download', s.download_profile ?? '—'],
                          ['Upload', s.upload_profile ?? '—'],
                          ['Porta de serviço', s.service_port_id != null ? String(s.service_port_id) : '—'],
                          ['Última vez visto', s.last_seen_at ? new Date(s.last_seen_at).toLocaleString('pt-BR') : '—'],
                        ].map(([label, val]) => (
                          <div key={label as string} className="flex justify-between border-b last:border-0 py-1">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium">{val || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()
        }
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setOpenStatus(false)}>Fechar</Button>
        </div>
      </Modal>

      {/* Modal: AO VIVO */}
      <Modal open={openLive} title="Tráfego AO VIVO" onClose={() => { setOpenLive(false); setLive(false) }}>
        <div className="mb-2 flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
          <span className="text-xs text-muted-foreground">{live ? 'Atualizando a cada 5s' : 'Pausado'}</span>
          <button
            className="ml-auto text-xs text-primary hover:underline"
            onClick={() => setLive(v => !v)}
          >{live ? 'Pausar' : 'Retomar'}</button>
        </div>
        {traffic.loading
          ? <p className="text-sm text-muted-foreground py-4 text-center">Carregando…</p>
          : <TrafficChart data={traffic.data ?? null} />
        }
        {traffic.data && traffic.data.items.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border p-2">
              <div className="text-muted-foreground mb-1">Download</div>
              <div className="flex justify-between"><span>Máximo</span><strong>{traffic.data.stats.rx_max?.toFixed(2) ?? '—'} Mbps</strong></div>
              <div className="flex justify-between"><span>Médio</span><strong>{traffic.data.stats.rx_avg?.toFixed(2) ?? '—'} Mbps</strong></div>
            </div>
            <div className="rounded border p-2">
              <div className="text-muted-foreground mb-1">Upload</div>
              <div className="flex justify-between"><span>Máximo</span><strong>{traffic.data.stats.tx_max?.toFixed(2) ?? '—'} Mbps</strong></div>
              <div className="flex justify-between"><span>Médio</span><strong>{traffic.data.stats.tx_avg?.toFixed(2) ?? '—'} Mbps</strong></div>
            </div>
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => { setOpenLive(false); setLive(false) }}>Fechar</Button>
        </div>
      </Modal>

    </div>
  )
}
