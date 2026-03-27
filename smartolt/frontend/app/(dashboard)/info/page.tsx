export const dynamic = 'force-dynamic'

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'
import { dashboardApi } from '@/lib/api/dashboard'
import { oltApi, type OltItem, type OltHistoryItem } from '@/lib/api/olt'
import { onuApi } from '@/lib/api/onu'
import { DataTable, type Column } from '@/components/shared/data-table'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

type ActivityRow = {
  action: string
  olt_id: number | null
  olt_name: string | null
  onu_serial: string | null
  user_email: string | null
  ip_address: string | null
  created_at: string
}

export default function InfoPage() {
  const olts = useApi(() => oltApi.list({ page_size: 1000 }))
  const events = useApi(() => dashboardApi.recentEvents(200))

  const [oltHistories, setOltHistories] = useState<Record<number, OltHistoryItem[]>>({})
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [serialToOnuId, setSerialToOnuId] = useState<Record<string, number>>({})

  // Fetch first page of history for each OLT (lightweight aggregation)
  useEffect(() => {
    async function fetchAll() {
      if (!olts.data?.items) return
      setLoadingHistory(true)
      const entries: Record<number, OltHistoryItem[]> = {}
      for (const o of olts.data.items) {
        try {
          const h = await oltApi.history(o.id, 1, 50)
          entries[o.id] = h.items
        } catch {}
      }
      setOltHistories(entries)
      setLoadingHistory(false)
    }
    fetchAll()
  }, [olts.data?.items?.length])

  const oltIndex = useMemo(() => {
    const map = new Map<number, OltItem>()
    for (const o of olts.data?.items ?? []) map.set(o.id, o)
    return map
  }, [olts.data?.items])

  // Resolve ONU IDs by serial to deep-link to detail page
  useEffect(() => {
    async function resolveIds() {
      const serials = Array.from(new Set((events.data?.items ?? []).map(e => e.onu_serial).filter(Boolean) as string[]))
      const missing = serials.filter(s => serialToOnuId[s] === undefined)
      for (const s of missing) {
        try {
          const r = await onuApi.list({ serial_number: s, page_size: 1 }) as any
          const id = r.items?.[0]?.id
          if (id) setSerialToOnuId(prev => ({ ...prev, [s]: id }))
        } catch { /* ignore */ }
      }
    }
    resolveIds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.data?.items])

  function formatEventAction(type: string, serial?: string | null): string {
    const s = serial ? serial : 'ONU'
    switch (type) {
      case 'onu_authorized': return `ONU ${s} autorizada`
      case 'onu_online':     return `ONU ${s} online`
      case 'onu_offline':    return `ONU ${s} offline`
      default:               return type.replace(/_/g, ' ')
    }
  }

  const rows: ActivityRow[] = useMemo(() => {
    const out: ActivityRow[] = []
    // From dashboard events (ONU-centric)
    for (const ev of events.data?.items ?? []) {
      const name = ev.olt_id ? oltIndex.get(ev.olt_id)?.name ?? null : null
      out.push({
        action: formatEventAction(ev.event_type, ev.onu_serial ?? undefined),
        olt_id: ev.olt_id,
        olt_name: name,
        onu_serial: ev.onu_serial,
        user_email: null,
        ip_address: null,
        created_at: ev.created_at,
      })
    }
    // From OLT history (admin actions)
    for (const [oltIdStr, items] of Object.entries(oltHistories)) {
      const oltId = Number(oltIdStr)
      const name  = oltIndex.get(oltId)?.name ?? null
      for (const it of items) {
        out.push({
          action: it.action,
          olt_id: oltId,
          olt_name: name,
          onu_serial: null,
          user_email: it.user_email,
          ip_address: null,
          created_at: it.created_at,
        })
      }
    }
    // Sort desc by date
    out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return out
  }, [events.data?.items, oltHistories, oltIndex])

  const columns: Column<ActivityRow>[] = [
    {
      key: 'action',
      header: 'Ação',
      className: 'w-[40%] max-w-0',
      cell: (r) => (
        <div className="truncate" title={r.action}>{r.action}</div>
      ),
    },
    {
      key: 'olt',
      header: 'OLT',
      className: 'w-[18%] max-w-0',
      cell: (r) => r.olt_id ? (
        <div className="truncate">{r.olt_id} — {r.olt_name ?? '—'}</div>
      ) : '—',
    },
    {
      key: 'onu',
      header: 'ONU',
      className: 'w-[18%] max-w-0',
      cell: (r) => r.onu_serial ? (
        serialToOnuId[r.onu_serial] ? (
          <Link href={`/onus/${serialToOnuId[r.onu_serial]}`} className="text-primary hover:underline" title={`Abrir detalhes ${r.onu_serial}`}>
            {r.onu_serial}
          </Link>
        ) : (
          <span title={r.onu_serial}>{r.onu_serial}</span>
        )
      ) : '—',
    },
    {
      key: 'user',
      header: 'Usuário',
      className: 'w-[12%] max-w-0',
      cell: (r) => r.user_email ? <span className="truncate">{r.user_email}</span> : '—',
    },
    {
      key: 'ip',
      header: 'Endereço IP',
      className: 'w-[12%] max-w-0',
      cell: (r) => r.ip_address ?? '—',
    },
    {
      key: 'date',
      header: 'Data',
      className: 'w-[16%] whitespace-nowrap',
      cell: (r) => new Date(r.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ]

  const loading = olts.loading || events.loading || loadingHistory

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold">Infos</h1>
          <span className="text-xs text-muted-foreground">— tabela completa do Active Feed</span>
        </div>
      </div>

      <DataTable<ActivityRow>
        columns={columns}
        data={rows}
        loading={loading}
        skeletonRows={10}
        emptyText={loading ? 'Carregando…' : 'Sem eventos.'}
      />
    </div>
  )
}
