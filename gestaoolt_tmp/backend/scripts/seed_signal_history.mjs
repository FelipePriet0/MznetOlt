/**
 * Semeia histórico de sinal óptico realista para as ONUs reais.
 * Cada ONU recebe 7 dias de amostras a cada 30 minutos (~336 pontos).
 * Rode com: node scripts/seed_signal_history.mjs
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Perfis de sinal por ONU — cada um conta uma história diferente
const ONU_PROFILES = [
  { serial: 'FHTTE6F94112', olt_id: 31, baseRx: -20.5, trend: 0,     noise: 0.4 },  // estável
  { serial: 'ALKL49538AD1', olt_id: 31, baseRx: -22.0, trend: -0.08,  noise: 0.8 },  // leve queda
  { serial: 'HWTCE1E1917E', olt_id: 31, baseRx: -19.0, trend: -0.15,  noise: 0.5 },  // queda consistente (rx_trend)
  { serial: 'ALKL1A55DCD5', olt_id: 31, baseRx: -21.5, trend: 0,      noise: 1.2 },  // instável (flapping)
  { serial: 'ZTEG41AC4ABE', olt_id: 31, baseRx: -23.0, trend: 0.02,   noise: 0.3 },  // leve melhora
  { serial: 'ZTEG10CC3933', olt_id: 31, baseRx: -18.5, trend: 0,      noise: 0.4 },  // ótimo sinal
  { serial: 'FHTTBF837394', olt_id: 31, baseRx: -24.5, trend: -0.12,  noise: 0.6 },  // degradando
  { serial: 'FHTT74656547', olt_id: 31, baseRx: -21.0, trend: 0,      noise: 0.5 },  // estável
]

const INTERVAL_MS   = 30 * 60 * 1000   // 30 min entre amostras
const DAYS          = 7
const TOTAL_POINTS  = (DAYS * 24 * 60 * 60 * 1000) / INTERVAL_MS  // ~336 por ONU
const BATCH_SIZE    = 200

function gaussian() {
  // Box-Muller para ruído gaussiano
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function generatePoints(profile) {
  const now    = Date.now()
  const start  = now - DAYS * 24 * 60 * 60 * 1000
  const points = []

  for (let i = 0; i < TOTAL_POINTS; i++) {
    const ts      = new Date(start + i * INTERVAL_MS).toISOString()
    const tFrac   = i / TOTAL_POINTS                          // 0..1 ao longo do tempo
    const drift   = profile.trend * tFrac * DAYS * 24        // drift total em dBm
    const noise   = gaussian() * profile.noise
    const rx_dbm  = parseFloat((profile.baseRx + drift + noise).toFixed(2))

    points.push({ ts, rx_dbm, olt_id: profile.olt_id, onu_serial: profile.serial })
  }

  return points
}

async function insertBatched(rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('onu_signal_history').insert(batch)
    if (error) throw error
    process.stdout.write('.')
  }
}

async function main() {
  console.log('[seed-signal] Iniciando seed de histórico de sinal...\n')

  for (const profile of ONU_PROFILES) {
    process.stdout.write(`  ${profile.serial} (${TOTAL_POINTS} pontos) `)
    const points = generatePoints(profile)
    try {
      await insertBatched(points)
      console.log(` OK`)
    } catch (err) {
      console.log(` ERRO: ${err.message}`)
    }
  }

  console.log('\n[seed-signal] Concluído.')
}

main()
