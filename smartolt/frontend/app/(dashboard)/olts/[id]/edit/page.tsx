'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { oltApi, type CreateOltInput, type OltDetail } from '@/lib/api/olt'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Skeleton } from '@/components/shared/skeleton'
import { ArrowLeft, Save, Wifi } from 'lucide-react'

const VENDORS = ['Huawei', 'ZTE', 'FiberHome', 'Nokia', 'Datacom']

const HW_VERSIONS: Record<string, string[]> = {
  Huawei:    ['Huawei-EA5800-X15', 'Huawei-EA5800-X7', 'Huawei-MA5608T', 'Huawei-MA5683T'],
  ZTE:       ['ZTE-C320', 'ZTE-C300', 'ZTE-C220'],
  FiberHome: ['FiberHome-AN5516-06', 'FiberHome-AN5516-04'],
  Nokia:     ['Nokia-7360-FX-4'],
  Datacom:   ['Datacom-DM4610'],
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-start gap-4 py-3 border-b last:border-0">
      <Label className="pt-2 text-sm font-medium text-right leading-snug">{label}</Label>
      <div className="space-y-1">
        {children}
        {hint && <p className="text-xs text-primary">{hint}</p>}
      </div>
    </div>
  )
}

export default function EditOltPage() {
  const params  = useParams<{ id: string }>()
  const oltId   = Number(params.id)
  const router  = useRouter()

  const fetcher = useCallback(() => oltApi.detail(oltId), [oltId])
  const { data: olt, loading } = useApi(fetcher, [oltId])

  const [form,   setForm]   = useState<Partial<CreateOltInput>>({})
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  useEffect(() => {
    if (!olt) return
    setForm({
      name:              olt.name,
      vendor:            olt.vendor,
      mgmt_ip:           olt.mgmt_ip,
      tcp_port:          olt.tcp_port,
      telnet_user:       olt.telnet_user ?? '',
      telnet_password:   olt.telnet_password ?? '',
      snmp_ro_community: olt.snmp_ro_community ?? '',
      snmp_rw_community: olt.snmp_rw_community ?? '',
      snmp_udp_port:     olt.snmp_udp_port,
      iptv_enabled:      olt.iptv_enabled,
      hw_version:        olt.hw_version ?? '',
      pon_type:          olt.pon_type,
      location_id:       olt.location_id,
      zone_id:           olt.zone_id,
    })
  }, [olt])

  function set<K extends keyof CreateOltInput>(key: K, value: CreateOltInput[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const hwOptions = HW_VERSIONS[form.vendor ?? 'Huawei'] ?? []

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.vendor || !form.mgmt_ip) {
      setError('Nome, fabricante e IP são obrigatórios.')
      return
    }
    setSaving(true); setError(null)
    try {
      await oltApi.update(oltId, form)
      router.push(`/olts/${oltId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="p-8 space-y-4 max-w-2xl mx-auto">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  )

  return (
    <div className="flex min-h-full items-start justify-center p-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wifi className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar OLT</h1>
            <p className="text-sm text-muted-foreground">{olt?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-center text-muted-foreground uppercase tracking-wide">Dados do equipamento</h2>
          </div>

          <Field label="Nome">
            <Input value={form.name ?? ''} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="Endereço IP ou FQDN do OLT">
            <Input value={form.mgmt_ip ?? ''} onChange={e => set('mgmt_ip', e.target.value)} className="font-mono" />
          </Field>
          <Field label="Porta TCP Telnet">
            <Input type="number" value={form.tcp_port ?? 2333} onChange={e => set('tcp_port', Number(e.target.value))} className="max-w-[140px] font-mono" />
          </Field>
          <Field label="Nome de usuário telnet do OLT">
            <Input value={form.telnet_user ?? ''} onChange={e => set('telnet_user', e.target.value)} />
          </Field>
          <Field label="Senha telnet do OLT">
            <Input type="password" value={form.telnet_password ?? ''} onChange={e => set('telnet_password', e.target.value)} />
          </Field>
          <Field label="Comunidade SNMP somente leitura" hint="Será criado automaticamente no OLT.">
            <Input value={form.snmp_ro_community ?? ''} onChange={e => set('snmp_ro_community', e.target.value)} className="font-mono" />
          </Field>
          <Field label="Comunidade SNMP de leitura e gravação" hint="Será criado automaticamente no OLT.">
            <Input value={form.snmp_rw_community ?? ''} onChange={e => set('snmp_rw_community', e.target.value)} className="font-mono" />
          </Field>
          <Field label="Porta SNMP UDP">
            <Input type="number" value={form.snmp_udp_port ?? 2161} onChange={e => set('snmp_udp_port', Number(e.target.value))} className="max-w-[140px] font-mono" />
          </Field>
          <Field label="Módulo IPTV">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.iptv_enabled ?? false} onChange={e => set('iptv_enabled', e.target.checked)} className="h-4 w-4 rounded border-border" />
              <span className="text-sm">Habilitar</span>
            </label>
          </Field>
          <Field label="Fabricante de OLT">
            <select
              value={form.vendor ?? ''}
              onChange={e => { const v = e.target.value; set('vendor', v); set('hw_version', (HW_VERSIONS[v] ?? [])[0] ?? '') }}
              className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Versão de hardware OLT">
            <select
              value={form.hw_version ?? ''}
              onChange={e => set('hw_version', e.target.value)}
              className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {hwOptions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Tipos de PON suportados">
            <div className="flex items-center gap-6 pt-1">
              {(['GPON', 'EPON', 'GPON+EPON'] as const).map(p => (
                <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="pon_type" value={p} checked={form.pon_type === p} onChange={() => set('pon_type', p)} className="h-4 w-4" />
                  <span className="text-sm">{p}</span>
                </label>
              ))}
            </div>
          </Field>

          {error && (
            <div className="mt-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />{saving ? 'Salvando…' : 'Salvar'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            </div>
            <Button type="button" variant="outline" onClick={() => alert('Teste de conexão — em breve')}>
              Teste de conexão
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
