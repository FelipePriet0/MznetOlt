"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { onuApi, type OnuDetail, type OnuStatus, type OnuSignalHistory, type OnuTrafficHistory } from '@/lib/api/onu'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowLeft, RefreshCw } from 'lucide-react'

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.max(0, Math.floor(diff / 60000))
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  return `há ${h} h`
}

function MiniLine({ series, color = 'hsl(var(--primary))' }: { series: { time: string; value: number }[]; color?: string }) {
  if (series.length === 0) return <div className="h-24 w-full bg-muted rounded" />
  const values = series.map(s => s.value)
  const max = Math.max(...values, 1)
  const pts = series.map((s, i) => `${(i/(series.length-1))*100},${100 - (s.value/max)*100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-24 w-full">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  )
}

export default function OnuDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)

  const detail = useApi<OnuDetail>(() => onuApi.detail(id), [id])
  const status = useApi<OnuStatus>(() => onuApi.status(id), [id])
  const signal = useApi<OnuSignalHistory>(() => onuApi.signal(id, 200), [id])
  const traffic = useApi<OnuTrafficHistory>(() => onuApi.traffic(id, 200), [id])

  const [live, setLive] = useState(false)
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => { status.refetch(); signal.refetch(); traffic.refetch() }, 5000)
    return () => clearInterval(t)
  }, [live])

  const signalSeries = useMemo(() => (signal.data?.items ?? []).map(s => ({ time: s.time, value: s.rx })), [signal.data])
  const trafficDown = useMemo(() => (traffic.data?.items ?? []).map(s => ({ time: s.time, value: s.download })), [traffic.data])
  const trafficUp = useMemo(() => (traffic.data?.items ?? []).map(s => ({ time: s.time, value: s.upload })), [traffic.data])

  if (Number.isNaN(id)) return <div className="p-8">ID inválido.</div>

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Detalhe da ONU</h1>
      </div>

      {/* Header */}
      <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="min-w-0">
          <p className="font-mono text-sm">{detail.data?.serial_number ?? '—'}</p>
          <p className="text-sm text-muted-foreground">{detail.data ? `${detail.data.onu_vendor ?? '—'} ${detail.data.onu_model ?? ''}` : '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status.data?.status ?? detail.data?.status ?? 'unknown'} pulse={status.data?.status === 'online'} />
          <Badge variant="secondary">{detail.data?.admin_state ?? '—'}</Badge>
          <span className="text-xs text-muted-foreground">{status.data ? relativeTime(status.data.last_seen_at) : '—'}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { detail.refetch(); status.refetch(); signal.refetch(); traffic.refetch() }}>
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </Button>
          <Button variant={live ? 'success' : 'outline'} size="sm" onClick={() => setLive(v => !v)}>
            AO VIVO
          </Button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { k: 'OLT', v: detail.data?.olt_name },
          { k: 'Board', v: detail.data ? `${detail.data.board_name} (slot ${detail.data.board_slot_index})` : '—' },
          { k: 'Porta', v: detail.data?.pon_port_name },
          { k: 'ONU ID', v: detail.data?.id?.toString() },
          { k: 'Canal', v: '—' },
          { k: 'SN', v: detail.data?.serial_number },
          { k: 'Tipo ONU', v: detail.data ? `${detail.data.onu_vendor ?? '—'} ${detail.data.onu_model ?? ''}` : '—' },
          { k: 'Zona', v: '—' },
          { k: 'Nome', v: '—' },
          { k: 'Endereço', v: '—' },
          { k: 'Contato', v: '—' },
          { k: 'Data de autorização', v: detail.data ? new Date(detail.data.created_at).toLocaleString('pt-BR') : '—' },
          { k: 'ID externo', v: '—' },
        ].map(({ k, v }) => (
          <div key={k} className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="text-sm font-medium truncate">{v ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Sinal */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sinal óptico</h2>
          <span className="text-xs text-muted-foreground">Último: {detail.data?.last_known_signal ?? '—'} dBm</span>
        </div>
        <MiniLine series={signalSeries} />
      </div>

      {/* Tráfego */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Tráfego (download / upload)</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Download</p>
            <MiniLine series={trafficDown} color="hsl(var(--primary))" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Upload</p>
            <MiniLine series={trafficUp} color="hsl(var(--success))" />
          </div>
        </div>
      </div>

      {/* Ações (somente endpoints existentes ativos) */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-2">Ações</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              try {
                await onuApi.resync(id)
                status.refetch()
              } catch (e) {
                console.error(e)
              }
            }}
          >
            Ressincronizar configuração
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                await onuApi.disable(id)
                status.refetch()
              } catch (e) {
                console.error(e)
              }
            }}
          >
            Desativar ONU
          </Button>
          <Button variant="outline" size="sm" disabled>Exibir configuração em execução</Button>
          <Button variant="outline" size="sm" disabled>Informações de software</Button>
        </div>
      </div>

    </div>
  )
}
