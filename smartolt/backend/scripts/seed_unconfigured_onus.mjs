/**
 * Seed simples de ONUs não configuradas (unconfigured) para testes das telas
 * /onus/unconfigured e /authorization.
 *
 * Requisitos:
 * - Variáveis de ambiente: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * - Ao menos 1 OLT existente na tabela public.olts
 *
 * Uso (PowerShell):
 *   setx SUPABASE_URL "https://<ref>.supabase.co"
 *   setx SUPABASE_SERVICE_ROLE_KEY "<service_role>"
 *   (feche e reabra o terminal) e então:
 *   node scripts/seed_unconfigured_onus.mjs
 *
 * Também aceita OLT_ID explícito:
 *   OLT_ID=123 node scripts/seed_unconfigured_onus.mjs
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const explicitOltId = process.env.OLT_ID ? Number(process.env.OLT_ID) : undefined

if (!url || !key) {
  console.error('[FAIL] Variáveis ausentes: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

const VENDOR_PREFIXES = ['HWTC', 'ZTEG', 'FHTT', 'ALKL']

async function resolveOltId() {
  if (explicitOltId) return explicitOltId
  const { data, error } = await supabase.from('olts').select('id').limit(1)
  if (error) throw new Error(`Erro ao consultar OLTs: ${error.message}`)
  if (!data || data.length === 0) throw new Error('Nenhuma OLT encontrada. Cadastre ao menos uma OLT antes de rodar o seed.')
  return data[0].id
}

function makeSerial(seen) {
  let serial
  do {
    const prefix = pick(VENDOR_PREFIXES)
    const hex = rand(0x10000000, 0xFFFFFFFF).toString(16).toUpperCase()
    serial = `${prefix}${hex}`
  } while (seen.has(serial))
  seen.add(serial)
  return serial
}

async function main() {
  try {
    const oltId = await resolveOltId()
    console.log(`[INFO] Usando OLT ID = ${oltId}`)

    const total = Number(process.env.COUNT || 20)
    const seen = new Set()
    const rows = []

    for (let i = 0; i < total; i++) {
      const serial = makeSerial(seen)
      const minutesAgo = rand(1, 240)
      rows.push({
        olt_id: oltId,
        onu_serial: serial,
        onu_id: null,
        source: 'unconfigured_poll',
        last_known_status: 'unconfigured',
        last_known_signal: null,
        last_seen_at: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
        raw_snapshot: { vendor: serial.slice(0,4), note: 'seed: unconfigured fake' },
      })
    }

    console.log(`[INFO] Inserindo ${rows.length} ONUs (unconfigured) em onu_network_snapshots...`)
    const { error } = await supabase
      .from('onu_network_snapshots')
      .upsert(rows, { onConflict: 'olt_id,onu_serial', ignoreDuplicates: false })
    if (error) throw error

    console.log('[OK] Seed de unconfigured ONUs concluído.')
  } catch (e) {
    console.error('[FAIL]', e?.message || e)
    process.exit(1)
  }
}

main()

