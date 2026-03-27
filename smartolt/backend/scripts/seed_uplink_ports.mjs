/**
 * seed_uplink_ports.mjs
 * Popula uplink_ports com dados realistas para smoke test.
 * Uso: node scripts/seed_uplink_ports.mjs [--clear]
 *
 * --clear  remove todos os registros de uplink_ports antes de inserir
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('[FAIL] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não definidos')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const clear = process.argv.includes('--clear')

// ── Busca OLTs existentes ────────────────────────────────────────────────────
const { data: olts, error: oltsErr } = await supabase
  .from('olts')
  .select('id, name, vendor')
  .order('id')

if (oltsErr) {
  console.error('[FAIL] Erro ao buscar OLTs:', oltsErr.message)
  process.exit(2)
}

if (!olts?.length) {
  console.error('[FAIL] Nenhuma OLT encontrada. Cadastre ao menos uma OLT antes de rodar este seed.')
  process.exit(3)
}

console.log(`[INFO] ${olts.length} OLT(s) encontrada(s):`)
olts.forEach(o => console.log(`       #${o.id} — ${o.name} (${o.vendor})`))

// ── Limpa se --clear ─────────────────────────────────────────────────────────
if (clear) {
  const { error } = await supabase.from('uplink_ports').delete().neq('id', 0)
  if (error) {
    console.error('[FAIL] Erro ao limpar uplink_ports:', error.message)
    process.exit(4)
  }
  console.log('[INFO] uplink_ports limpa.')
}

// ── Template de portas por fabricante ───────────────────────────────────────
function uplinkPortsForOlt(oltId, vendor) {
  const isZte    = vendor?.toLowerCase().includes('zte')
  const isHuawei = vendor?.toLowerCase().includes('huawei')

  if (isZte) {
    return [
      { olt_id: oltId, name: 'xge-uplink_1/1',  fiber: 'Fibra', admin_state: 'Habilitado', status: 'Habilitado', negotiation: 'Auto',    mtu: 9216, duplex: 'Full', pvid: 1,   vlan_mode: 'Tronco',     tagged_vlans: '11,100,200,300,3102',    description: 'Uplink principal' },
      { olt_id: oltId, name: 'xge-uplink_1/2',  fiber: 'Fibra', admin_state: 'Habilitado', status: 'Habilitado', negotiation: 'Auto',    mtu: 9216, duplex: 'Full', pvid: 1,   vlan_mode: 'Tronco',     tagged_vlans: '11,100,200',             description: 'Uplink backup'    },
      { olt_id: oltId, name: 'gei-0/2/1',       fiber: 'Fibra', admin_state: 'Habilitado', status: 'Abaixo',    negotiation: 'Forçado', mtu: 1500, duplex: 'Full', pvid: 256, vlan_mode: 'Porta-malas', tagged_vlans: null,                     description: null               },
    ]
  }

  if (isHuawei) {
    return [
      { olt_id: oltId, name: 'ethernet0/7/0',   fiber: 'Fibra', admin_state: 'Habilitado', status: 'Habilitado', negotiation: 'Auto',    mtu: 2048, duplex: 'Full', pvid: 256, vlan_mode: 'Porta-malas', tagged_vlans: null,                            description: 'Uplink principal' },
      { olt_id: oltId, name: 'ethernet0/7/1',   fiber: 'Fibra', admin_state: 'Habilitado', status: 'Habilitado', negotiation: 'Auto',    mtu: 2048, duplex: 'Full', pvid: 256, vlan_mode: 'Porta-malas', tagged_vlans: null,                            description: 'Uplink backup'    },
      { olt_id: oltId, name: 'ethernet0/7/2',   fiber: 'Fibra', admin_state: 'Habilitado', status: 'Habilitado', negotiation: 'Forçado', mtu: 9000, duplex: 'Full', pvid: 0,   vlan_mode: 'Tronco',      tagged_vlans: '11,102,3102,3702,5100,5200',    description: 'Interlink backbone' },
      { olt_id: oltId, name: 'ethernet0/8/0',   fiber: 'Fibra', admin_state: 'Habilitado', status: 'Abaixo',    negotiation: 'Auto',    mtu: null, duplex: 'Auto', pvid: 1,   vlan_mode: 'Porta',       tagged_vlans: null,                            description: null               },
      { olt_id: oltId, name: 'ethernet0/8/1',   fiber: 'Fibra', admin_state: 'Habilitado', status: 'Abaixo',    negotiation: 'Auto',    mtu: null, duplex: 'Auto', pvid: 1,   vlan_mode: 'Porta',       tagged_vlans: null,                            description: null               },
    ]
  }

  // Genérico (FiberHome, Nokia, Datacom)
  return [
    { olt_id: oltId, name: 'ge0/0',  fiber: 'Fibra', admin_state: 'Habilitado', status: 'Habilitado', negotiation: 'Auto', mtu: 1500, duplex: 'Full', pvid: 1,   vlan_mode: 'Tronco',     tagged_vlans: '100,200,300', description: 'Uplink principal' },
    { olt_id: oltId, name: 'ge0/1',  fiber: 'Fibra', admin_state: 'Habilitado', status: 'Abaixo',    negotiation: 'Auto', mtu: 1500, duplex: 'Full', pvid: 1,   vlan_mode: 'Porta',      tagged_vlans: null,          description: null               },
  ]
}

// ── Insere para cada OLT ─────────────────────────────────────────────────────
let totalInserido = 0

for (const olt of olts) {
  const ports = uplinkPortsForOlt(olt.id, olt.vendor)

  const { data, error } = await supabase
    .from('uplink_ports')
    .upsert(ports, { onConflict: 'olt_id,name', ignoreDuplicates: false })
    .select('id, name')

  if (error) {
    console.error(`[FAIL] OLT #${olt.id} (${olt.name}):`, error.message)
    continue
  }

  console.log(`[OK] OLT #${olt.id} — ${olt.name}: ${data?.length ?? 0} porta(s) inserida(s)`)
  data?.forEach(p => console.log(`       → ${p.name}`))
  totalInserido += data?.length ?? 0
}

console.log(`\n[DONE] Total inserido: ${totalInserido} porta(s) de uplink.`)
