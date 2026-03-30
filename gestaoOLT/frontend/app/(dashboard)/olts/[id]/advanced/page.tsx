'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { oltApi, type OltDetail } from '@/lib/api/olt'
import { useApi } from '@/hooks/use-api'
import { Skeleton } from '@/components/shared/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'

type AdvancedForm = Pick<OltDetail,
  | 'show_disabled_onus'
  | 'onu_description_format'
  | 'use_dhcp_option82'
  | 'dhcp_option82_field'
  | 'use_dhcp_option82_mgmt'
  | 'dhcp_option82_mgmt_field'
  | 'use_pppoe_plus'
  | 'onu_ip_source_guard'
  | 'use_max_mac_learn'
  | 'max_mac_per_onu'
  | 'use_mac_allowlist'
  | 'use_mac_denylist'
  | 'use_port_acl'
  | 'port_acl_field'
  | 'rx_warning_dbm'
  | 'rx_critical_dbm'
  | 'separate_voip_mgmt_hosts'
  | 'temp_warning_celsius'
  | 'temp_critical_celsius'
  | 'tag_transform_mode'
  | 'use_cvlan_id'
  | 'use_svlan_id'
>

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[280px_1fr] items-start gap-4 py-3 border-b last:border-0">
      <label className="pt-1 text-sm text-muted-foreground text-right leading-snug">{label}</label>
      <div>{children}</div>
    </div>
  )
}

function Check({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-border accent-primary"
    />
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    />
  )
}

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={e => onChange(Number(e.target.value.replace(/[^\d-]/g, '')))}
      className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
    />
  )
}

export default function OltAdvancedPage() {
  const params = useParams<{ id: string }>()
  const oltId  = Number(params.id)
  const router = useRouter()

  const fetcher = useCallback(() => oltApi.detail(oltId), [oltId])
  const { data: olt, loading } = useApi(fetcher, [oltId])

  const [form,   setForm]   = useState<Partial<AdvancedForm>>({})
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  useEffect(() => {
    if (!olt) return
    setForm({
      show_disabled_onus:       olt.show_disabled_onus,
      onu_description_format:   olt.onu_description_format,
      use_dhcp_option82:        olt.use_dhcp_option82,
      dhcp_option82_field:      olt.dhcp_option82_field ?? '',
      use_dhcp_option82_mgmt:   olt.use_dhcp_option82_mgmt,
      dhcp_option82_mgmt_field: olt.dhcp_option82_mgmt_field ?? '',
      use_pppoe_plus:           olt.use_pppoe_plus,
      onu_ip_source_guard:      olt.onu_ip_source_guard,
      use_max_mac_learn:        olt.use_max_mac_learn,
      max_mac_per_onu:          olt.max_mac_per_onu,
      use_mac_allowlist:        olt.use_mac_allowlist,
      use_mac_denylist:         olt.use_mac_denylist,
      use_port_acl:             olt.use_port_acl,
      port_acl_field:           olt.port_acl_field ?? '',
      rx_warning_dbm:           olt.rx_warning_dbm,
      rx_critical_dbm:          olt.rx_critical_dbm,
      separate_voip_mgmt_hosts: olt.separate_voip_mgmt_hosts,
      temp_warning_celsius:     olt.temp_warning_celsius,
      temp_critical_celsius:    olt.temp_critical_celsius,
      tag_transform_mode:       olt.tag_transform_mode,
      use_cvlan_id:             olt.use_cvlan_id,
      use_svlan_id:             olt.use_svlan_id,
    })
  }, [olt])

  function set<K extends keyof AdvancedForm>(key: K, value: AdvancedForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      await oltApi.update(oltId, {
        ...form,
        dhcp_option82_field:      form.dhcp_option82_field      || null,
        dhcp_option82_mgmt_field: form.dhcp_option82_mgmt_field || null,
        port_acl_field:           form.port_acl_field           || null,
      })
      router.push(`/olts/${oltId}?tab=advanced`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  )

  return (
    <div className="flex min-h-full items-start justify-center p-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configurações avançadas</h1>
            <p className="text-sm text-muted-foreground">{olt?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-0">

          {/* Grupo principal */}
          <Row label="Exibir ONUs desativadas pelo administrador em Não configurado">
            <Check
              checked={form.show_disabled_onus ?? false}
              onChange={v => set('show_disabled_onus', v)}
            />
          </Row>

          <Row label="Enviar descrição das ONUs para a configuração do OLT">
            <div className="space-y-1.5">
              {([
                { value: 'short',    label: 'Nome curto (apenas o nome)' },
                { value: 'medium',   label: 'Meio (Nome, Endereço)' },
                { value: 'long',     label: 'Texto longo (Nome, Endereço, Zona etc.)' },
                { value: 'disabled', label: 'Desativado (nenhuma descrição da ONU será enviada para a configuração do OLT)' },
              ] as const).map(opt => (
                <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="onu_description_format"
                    value={opt.value}
                    checked={(form.onu_description_format ?? 'long') === opt.value}
                    onChange={() => set('onu_description_format', opt.value)}
                    className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                  />
                  <span className="text-sm leading-snug">{opt.label}</span>
                </label>
              ))}
            </div>
          </Row>

          <Row label="Use a opção 82 do DHCP">
            <Check checked={form.use_dhcp_option82 ?? false} onChange={v => set('use_dhcp_option82', v)} />
          </Row>

          <Row label="Campo Opção 82 do DHCP">
            <TextInput value={form.dhcp_option82_field ?? ''} onChange={v => set('dhcp_option82_field', v as unknown as null)} />
          </Row>

          <Row label="Use a opção DHCP 82 para gerenciamento">
            <Check checked={form.use_dhcp_option82_mgmt ?? false} onChange={v => set('use_dhcp_option82_mgmt', v)} />
          </Row>

          <Row label="Campo Opção 82 do DHCP para Gerenciamento">
            <TextInput value={form.dhcp_option82_mgmt_field ?? ''} onChange={v => set('dhcp_option82_mgmt_field', v as unknown as null)} />
          </Row>

          <Row label="Use PPPoE-plus">
            <Check checked={form.use_pppoe_plus ?? false} onChange={v => set('use_pppoe_plus', v)} />
          </Row>

          <Row label="ONU IP source-guard">
            <Check checked={form.onu_ip_source_guard ?? false} onChange={v => set('onu_ip_source_guard', v)} />
          </Row>

          <Row label="Use max-mac-learn">
            <Check checked={form.use_max_mac_learn ?? false} onChange={v => set('use_max_mac_learn', v)} />
          </Row>

          <Row label="Número máximo de MACs permitidos na porta virtual da internet por ONU">
            <NumInput value={form.max_mac_per_onu ?? 5} onChange={v => set('max_mac_per_onu', v)} />
          </Row>

          <Row label="Use a lista de permissões do MAC">
            <Check checked={form.use_mac_allowlist ?? false} onChange={v => set('use_mac_allowlist', v)} />
          </Row>

          <Row label="Use a lista suspensa MAC">
            <Check checked={form.use_mac_denylist ?? false} onChange={v => set('use_mac_denylist', v)} />
          </Row>

          <Row label="Use ACLs de filtragem de portas">
            <Check checked={form.use_port_acl ?? false} onChange={v => set('use_port_acl', v)} />
          </Row>

          <Row label="ACL de filtragem de portas">
            <TextInput value={form.port_acl_field ?? ''} onChange={v => set('port_acl_field', v as unknown as null)} />
          </Row>

          <Row label='Nível de sinal RX "aviso" (dBm)'>
            <NumInput value={form.rx_warning_dbm ?? -30} onChange={v => set('rx_warning_dbm', v)} />
          </Row>

          <Row label='Nível de sinal RX "crítico" (dBm)'>
            <NumInput value={form.rx_critical_dbm ?? -32} onChange={v => set('rx_critical_dbm', v)} />
          </Row>

          <Row label="Hosts IP separados para VoIP/Gerenciamento">
            <Check checked={form.separate_voip_mgmt_hosts ?? false} onChange={v => set('separate_voip_mgmt_hosts', v)} />
          </Row>

          <Row label='Nível de temperatura OLT "aviso" (°C)'>
            <NumInput value={form.temp_warning_celsius ?? 45} onChange={v => set('temp_warning_celsius', v)} />
          </Row>

          <Row label='Nível de temperatura OLT "crítico" (°C)'>
            <NumInput value={form.temp_critical_celsius ?? 55} onChange={v => set('temp_critical_celsius', v)} />
          </Row>

          {/* Separador com aviso */}
          <div className="py-4">
            <p className="text-xs text-destructive font-medium text-right">
              Não habilite nem modifique essas opções a menos que você realmente entenda o que elas fazem.
            </p>
          </div>

          <Row label="Modo de transformação de tags padrão">
            <select
              value={form.tag_transform_mode ?? 'traduzir'}
              onChange={e => set('tag_transform_mode', e.target.value)}
              className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {['traduzir', 'empurrar', 'retirar', 'substituir'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Row>

          <Row label="Use a opção CVLAN-ID">
            <Check checked={form.use_cvlan_id ?? false} onChange={v => set('use_cvlan_id', v)} />
          </Row>

          <Row label="Use a opção SVLAN-ID">
            <Check checked={form.use_svlan_id ?? false} onChange={v => set('use_svlan_id', v)} />
          </Row>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {/* Botões */}
          <div className="flex items-center gap-3 pt-6 border-t mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
