"use client"

import { useEffect, useMemo, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { oltApi, type OltItem } from '@/lib/api/olt'
import { unconfiguredApi, type UnconfiguredOnuItem } from '@/lib/api/unconfigured'
import { authorizationApi, type AuthorizationPreset } from '@/lib/api/authorization'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/shared/select-field'
import { Input } from '@/components/ui/input'
import { settingsApi, type VlanItem, type ZoneItem } from '@/lib/api/settings'
import { onuApi } from '@/lib/api/onu'
import { X as IconX } from 'lucide-react'

function GroupedTable({ title, items, onAuthorize }: { title: string; items: UnconfiguredOnuItem[]; onAuthorize: (item: UnconfiguredOnuItem) => void }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{items.length} detectada(s)</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma ONU não configurada encontrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left">Tipo PON</th>
                <th className="px-3 py-2 text-left">Quadro</th>
                <th className="px-3 py-2 text-left">Porta</th>
                <th className="px-3 py-2 text-left">Descrição da PON</th>
                <th className="px-3 py-2 text-left">SN</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{it.pon_type ?? '—'}</td>
                  <td className="px-3 py-2">{it.board_name}</td>
                  <td className="px-3 py-2">{it.pon_port_name}</td>
                  <td className="px-3 py-2">{it.pon_port_description ?? '—'}</td>
                  <td className="px-3 py-2">{it.serial_number}</td>
                  <td className="px-3 py-2">{(it.onu_vendor || it.onu_model) ? `${it.onu_vendor ?? ''} ${it.onu_model ?? ''}`.trim() : '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      title="Autoriza a ONU com parâmetros padrão definidos pelo backend"
                      className="text-primary text-sm underline-offset-2 hover:underline"
                      onClick={() => onAuthorize(it)}
                    >
                      Autorizar
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
}

export default function UnconfiguredPage() {
  const [selectedOlt, setSelectedOlt] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [selectedOnuId, setSelectedOnuId] = useState<number | null>(null)
  const [selectedOnuItem, setSelectedOnuItem] = useState<UnconfiguredOnuItem | null>(null)
  const [usePreset, setUsePreset] = useState(true)
  const [selectedPresetId, setSelectedPresetId] = useState<number | undefined>(undefined)
  const [authError, setAuthError] = useState<string | null>(null)

  const olts = useApi(() => oltApi.list({ page_size: 1000 }), [])
  const data = useApi(() => unconfiguredApi.list({ olt_id: selectedOlt ?? undefined, page_size: 1000 }), [selectedOlt])

  const groups = useMemo(() => {
    const by: Record<string, UnconfiguredOnuItem[]> = {}
    for (const it of data.data?.items ?? []) {
      const key = `${it.olt_id}::${it.olt_name}`
      if (!by[key]) by[key] = []
      by[key].push(it)
    }
    return Object.entries(by).map(([k, items]) => ({ key: k, title: items[0]?.olt_name || 'OLT', items }))
  }, [data.data])

  function openAuthorize(item: UnconfiguredOnuItem) {
    setSelectedOnuItem(item)
    setSelectedOnuId(item.id)
    setShowAuth(true)
  }

  // Dados da ONU
  const onuDetails = useApi(() => selectedOnuId ? onuApi.detail(selectedOnuId) : Promise.resolve(null), [selectedOnuId])
  // Presets
  const presets = useApi(() => authorizationApi.listPresets({ is_active: true, page_size: 100 }), [])
  const presetDefault = useApi(() => authorizationApi.getDefault(), [])
  useEffect(() => {
    const id = (presetDefault.data as any)?.id ?? (presetDefault.data as any)?.item?.id
    if (id) {
      setSelectedPresetId(id)
      setUsePreset(true)
    } else if (presetDefault.error || presetDefault.status === 404) {
      setSelectedPresetId(undefined)
      setUsePreset(false)
    }
  }, [presetDefault.data, presetDefault.error, presetDefault.status])

  // VLANs (para campo "ID da VLAN do usuário")
  const vlans = useApi(() => settingsApi.vlans(), [])
  const zones = useApi(() => settingsApi.zones(), [])

  // Estado editável dos campos
  const [tipoPON, setTipoPON] = useState<'GPON'|'EPON'|''>('')
  const [canalGPON, setCanalGPON] = useState<'GPON'|'XG-PON'|'XGS-PON'|''>('')
  const [modoONU, setModoONU] = useState<'Roteamento'|'Ponte'|''>('')
  const [vlanId, setVlanId] = useState<number|undefined>(undefined)
  const [zoneId, setZoneId] = useState<number|undefined>(undefined)
  const [nameVal, setNameVal] = useState<string>('')
  const [addressVal, setAddressVal] = useState<string>('')
  const [externalIdVal, setExternalIdVal] = useState<string>('')

  // Inicializa estados quando carrega detalhes
  useEffect(() => {
    const d = onuDetails.data
    if (!d && selectedOnuItem) {
      // fallback inicial pelos dados da listagem
      const pt = (selectedOnuItem.pon_type || '').toLowerCase()
      if (pt.includes('epon')) { setTipoPON('EPON'); setCanalGPON('') }
      else if (pt.includes('xgs')) { setTipoPON('GPON'); setCanalGPON('XGS-PON') }
      else if (pt.includes('xg')) { setTipoPON('GPON'); setCanalGPON('XG-PON') }
      else if (pt.includes('gpon')) { setTipoPON('GPON'); setCanalGPON('GPON') }
      setNameVal(selectedOnuItem.onu_vendor || selectedOnuItem.onu_model || '')
      return
    }
    if (!d) return
    const pt = (d.pon_type || '').toLowerCase()
    if (pt.includes('epon')) {
      setTipoPON('EPON'); setCanalGPON('')
    } else if (pt.includes('xgs')) {
      setTipoPON('GPON'); setCanalGPON('XGS-PON')
    } else if (pt.includes('xg')) {
      setTipoPON('GPON'); setCanalGPON('XG-PON')
    } else if (pt.includes('gpon')) {
      setTipoPON('GPON'); setCanalGPON('GPON')
    } else {
      setTipoPON(''); setCanalGPON('')
    }
    const md = (d.mode || '').toLowerCase()
    setModoONU(md === 'ponte' ? 'Ponte' : md === 'roteamento' ? 'Roteamento' : '')
    setVlanId(d.vlan_id ?? undefined)
    setZoneId(d.zone_id ?? undefined)
    setNameVal(d.name ?? '')
    setAddressVal(d.address ?? '')
    setExternalIdVal(d.external_id ?? '')
  }, [onuDetails.data])

  async function submitAuthorization() {
    if (!selectedOnuId) return
    try {
      setBusy(true)
      setAuthError(null)
      // Montar patch para atualizar a ONU antes de autorizar
      let patchedPonType: string | null = null
      if (tipoPON === 'EPON') patchedPonType = 'epon'
      else if (tipoPON === 'GPON') {
        if (canalGPON === 'XGS-PON') patchedPonType = 'xgs-pon'
        else if (canalGPON === 'XG-PON') patchedPonType = 'xg-pon'
        else patchedPonType = 'gpon'
      }
      const patchedMode = modoONU === 'Ponte' ? 'ponte' : (modoONU === 'Roteamento' ? 'roteamento' : null)

      const patch: Record<string, unknown> = {}
      if (patchedPonType !== null) patch.pon_type = patchedPonType
      if (patchedMode !== null) patch.mode = patchedMode
      if (typeof vlanId === 'number') patch.vlan_id = vlanId
      if (typeof zoneId === 'number') patch.zone_id = zoneId
      patch.name = nameVal
      patch.address = addressVal
      patch.external_id = externalIdVal

      await onuApi.update(selectedOnuId, patch)

      await authorizationApi.authorize({ onu_id: selectedOnuId, preset_id: usePreset ? selectedPresetId : undefined })
      setShowAuth(false)
      setSelectedOnuId(null)
      data.refetch()
    } catch (e: any) {
      setAuthError(e?.message || 'Falha ao autorizar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">ONUs Não Configuradas</h1>
      </div>

      {/* Toolbar (sem CTA Atualizar) */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">OLT</div>
          <SelectField
            valueId={selectedOlt}
            onChange={setSelectedOlt}
            options={(olts.data?.items ?? []).map((o: OltItem) => ({ id: o.id, name: `${o.name}` }))}
            placeholder="Todas"
          />
        </div>
      </div>

      {/* Removido: Ações Automáticas */}

      {/* Nota de comportamento (sem CTA Atualizar) */}
      <p className="text-xs text-muted-foreground">
        A lista é atualizada quando há novas detecções pelas rotinas internas. Se necessário, recarregue a página para ver mudanças.
      </p>

      {/* Error banner (dev) */}
      {(err || data.error) && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err || data.error}
        </div>
      )}

      {/* Groups by OLT */}
      {data.loading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Nenhuma ONU não configurada encontrada.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g, idx) => (
            <div key={g.key} className="flex flex-col gap-2">
              <div className="text-sm font-semibold flex items-center justify-between">
                <span>{idx + 1} – {g.title}</span>
                <span className="text-xs text-muted-foreground">{g.items.length} detectada(s)</span>
              </div>
              <GroupedTable title={g.title} items={g.items} onAuthorize={openAuthorize} />
            </div>
          ))}
        </div>
      )}

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-stretch sm:items-center sm:justify-center bg-black/50 p-3 sm:p-6">
          <div className="w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-xl sm:border bg-card p-4 md:p-6 shadow-lg overflow-y-auto">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Autorizar ONU</h2>
              <button aria-label="Fechar" className="p-2 rounded hover:bg-muted/50 transition-colors" onClick={() => setShowAuth(false)}>
                <IconX className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Preset */}
            <div className="mb-4 space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <input type="checkbox" checked={usePreset} onChange={e => setUsePreset(e.target.checked)} disabled /> Usar predefinição
              </label>
              <SelectField
                valueId={selectedPresetId}
                onChange={() => { /* read-only */ }}
                options={(presets.data?.items ?? []).map((p: AuthorizationPreset) => ({ id: p.id, name: p.name }))}
                placeholder="Nenhum"
                disabled={true}
              />
            </div>

            {/* Campos preenchidos (somente leitura) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">OLT</div>
                <Input value={onuDetails.data?.olt_name ?? selectedOnuItem?.olt_name ?? ''} readOnly className="bg-muted/40" />
              </div>
              {/* Tipo PON (radios, somente leitura) */}
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Tipo PON</div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 opacity-70">
                    <input type="radio" name="tipo_pon" checked={tipoPON==='GPON'} onChange={() => setTipoPON('GPON')} /> GPON
                  </label>
                  <label className="inline-flex items-center gap-2 opacity-70">
                    <input type="radio" name="tipo_pon" checked={tipoPON==='EPON'} onChange={() => setTipoPON('EPON')} /> EPON
                  </label>
                </div>
              </div>
              {/* Canal GPON (radios, somente leitura) */}
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Canal GPON</div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 opacity-70">
                    <input type="radio" name="canal_gpon" checked={canalGPON==='GPON'} onChange={() => setCanalGPON('GPON')} disabled={tipoPON==='EPON'} /> GPON
                  </label>
                  <label className="inline-flex items-center gap-2 opacity-70">
                    <input type="radio" name="canal_gpon" checked={canalGPON==='XG-PON'} onChange={() => setCanalGPON('XG-PON')} disabled={tipoPON==='EPON'} /> XG-PON
                  </label>
                  <label className="inline-flex items-center gap-2 opacity-70">
                    <input type="radio" name="canal_gpon" checked={canalGPON==='XGS-PON'} onChange={() => setCanalGPON('XGS-PON')} disabled={tipoPON==='EPON'} /> XGS-PON
                  </label>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">SN</div>
                <Input value={onuDetails.data?.serial_number ?? selectedOnuItem?.serial_number ?? ''} readOnly className="bg-muted/40" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Quadro</div>
                <Input value={onuDetails.data?.board_name ?? selectedOnuItem?.board_name ?? String(onuDetails.data?.board_id ?? '')} readOnly className="bg-muted/40" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Porta</div>
                <Input value={onuDetails.data?.pon_port_name ?? selectedOnuItem?.pon_port_name ?? String(onuDetails.data?.pon_port_id ?? '')} readOnly className="bg-muted/40" />
              </div>
              {/* Modo ONU (radios, somente leitura) */}
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Modo ONU</div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 opacity-70">
                    <input type="radio" name="modo_onu" checked={modoONU==='Roteamento'} onChange={() => setModoONU('Roteamento')} /> Roteamento
                  </label>
                  <label className="inline-flex items-center gap-2 opacity-70">
                    <input type="radio" name="modo_onu" checked={modoONU==='Ponte'} onChange={() => setModoONU('Ponte')} /> Ponte
                  </label>
                </div>
              </div>
              {/* ID da VLAN do usuário (select somente leitura) */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">ID da VLAN do usuário</div>
                <SelectField
                  valueId={vlanId}
                  onChange={(id) => setVlanId(id ?? undefined)}
                  options={(vlans.data?.items ?? []).map((v: VlanItem) => ({ id: v.vlan_id, name: `${v.vlan_id} - ${v.description}` }))}
                  placeholder="—"
                  disabled={false}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Zona</div>
                <SelectField
                  valueId={zoneId}
                  onChange={(id) => setZoneId(id ?? undefined)}
                  options={(zones.data?.items ?? []).map((z: ZoneItem) => ({ id: z.id, name: z.name }))}
                  placeholder="—"
                />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Nome</div>
                <Input value={nameVal} onChange={e => setNameVal(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Endereço ou comentário</div>
                <Input value={addressVal} onChange={e => setAddressVal(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">ID externo da ONU</div>
                <Input value={externalIdVal} onChange={e => setExternalIdVal(e.target.value)} />
              </div>
            </div>

            {authError && (
              <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{authError}</div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <Button onClick={submitAuthorization} disabled={busy || (usePreset && !selectedPresetId)} className="w-full sm:w-auto">Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
