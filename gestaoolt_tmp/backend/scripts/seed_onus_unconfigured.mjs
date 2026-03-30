/**
 * Seed de ONUs na tabela public.onus com admin_state='unconfigured'.
 * Gera linhas ligadas a uma OLT, Board e PON Port existentes (ou cria 1 de cada se não existirem).
 *
 * Requisitos:
 * - SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente
 * - COUNT (opcional, default 20)
 * - OLT_ID (opcional, força a OLT alvo)
 *
 * Uso (PowerShell, na pasta smartolt/backend):
 *   $env:SUPABASE_URL="https://<ref>.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role>"
 *   node scripts/seed_onus_unconfigured.mjs
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const COUNT = Number(process.env.COUNT || 20)
const OLT_ID = process.env.OLT_ID ? Number(process.env.OLT_ID) : undefined

if (!url || !key) {
  console.error('[FAIL] Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
const VENDOR_PREFIXES = ['HWTC', 'ZTEG', 'FHTT', 'ALKL']

async function ensureOltId() {
  if (OLT_ID) return OLT_ID
  const { data, error } = await db.from('olts').select('id').limit(1)
  if (error) throw new Error(`Erro ao buscar OLTs: ${error.message}`)
  if (!data || !data.length) throw new Error('Nenhuma OLT encontrada. Cadastre ao menos uma OLT.')
  return data[0].id
}

async function ensureBoard(olt_id) {
  let { data, error } = await db.from('boards').select('id, slot_index').eq('olt_id', olt_id).limit(1)
  if (error) throw new Error(`Erro ao buscar boards: ${error.message}`)
  if (data && data.length) return data[0]
  const name = 'BOARD-1'
  const slot_index = 1
  ;({ data, error } = await db
    .from('boards')
    .insert({ olt_id, slot_index, name })
    .select('id, slot_index')
    .limit(1))
  if (error) throw new Error(`Erro ao criar board: ${error.message}`)
  return data[0]
}

async function ensurePonPort(board_id) {
  let { data, error } = await db.from('pon_ports').select('id, pon_index').eq('board_id', board_id).limit(1)
  if (error) throw new Error(`Erro ao buscar PON ports: ${error.message}`)
  if (data && data.length) return data[0]
  const name = 'PON-1'
  const pon_index = 1
  ;({ data, error } = await db
    .from('pon_ports')
    .insert({ board_id, pon_index, name })
    .select('id, pon_index')
    .limit(1))
  if (error) throw new Error(`Erro ao criar PON port: ${error.message}`)
  return data[0]
}

function makeSerial(seen) {
  let s
  do {
    const prefix = pick(VENDOR_PREFIXES)
    const hex = rand(0x10000000, 0xffffffff).toString(16).toUpperCase()
    s = `${prefix}${hex}`
  } while (seen.has(s))
  seen.add(s)
  return s
}

async function main() {
  try {
    const olt_id = await ensureOltId()
    const board = await ensureBoard(olt_id)
    const port = await ensurePonPort(board.id)
    console.log(`[INFO] OLT=${olt_id} BOARD=${board.id} PON_PORT=${port.id}`)

    const seen = new Set()
    const rows = []
    for (let i = 0; i < COUNT; i++) {
      rows.push({
        serial_number: makeSerial(seen),
        olt_id,
        board_id: board.id,
        pon_port_id: port.id,
        status: 'offline',
        admin_state: 'unconfigured',
        last_known_signal: null,
        last_seen_at: new Date(Date.now() - rand(1, 180) * 60 * 1000).toISOString(),
      })
    }

    const { error } = await db.from('onus').insert(rows)
    if (error) throw error
    console.log(`[OK] Inseridas ${rows.length} ONUs unconfigured em public.onus`)
  } catch (e) {
    console.error('[FAIL]', e?.message || e)
    process.exit(1)
  }
}

main()

