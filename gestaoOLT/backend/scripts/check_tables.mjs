import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('[FAIL] Variáveis ausentes: verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const tables = [
  'authorization_events',
  'authorization_preset_profiles',
  'authorization_presets',
  'boards',
  'data_exports',
  'locations',
  'network_events',
  'network_sync_runs',
  // removed: odbs, olt_health_samples (graphs/settings)
  'olts',
  'onu_authorizations',
  'onu_network_snapshots',
  // removed: onu_types (settings)
  'onus',
  'pon_ports',
  'roles',
  // removed: speed_profiles (settings)
  // graphs-related tables removed
  'users',
  'vlans',
  'zones',
]

console.log(`[INFO] Verificando existência de ${tables.length} tabelas no schema público...`)

const existing = []
const missing = []

for (const t of tables) {
  try {
    const { error } = await supabase.from(t).select('*').limit(1)
    if (error) {
      if (
        /(?:relation|table) .* does not exist/i.test(error.message) ||
        /Could not find the table/i.test(error.message)
      ) {
        console.log(`[MISS] ${t}`)
        missing.push(t)
      } else {
        console.log(`[WARN] ${t} -> erro ao consultar: ${error.message}`)
        existing.push(t) // provavelmente existe mas houve outro erro (RLS/perm etc.)
      }
    } else {
      console.log(`[OK]   ${t}`)
      existing.push(t)
    }
  } catch (e) {
    console.log(`[ERR]  ${t} -> ${(e && e.message) || e}`)
  }
}

console.log('\nResumo:')
console.log(` - Encontradas: ${existing.length}`)
console.log(` - Não encontradas: ${missing.length}`)
if (missing.length) {
  console.log('   ->', missing.join(', '))
}
