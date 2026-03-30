import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const REF = process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF || 'cnyglvhnnyssnviljptr'
const PAT = process.env.SUPABASE_ACCESS_TOKEN
if (!PAT) {
  console.error('[FAIL] Forneça o token via SUPABASE_ACCESS_TOKEN')
  process.exit(1)
}

async function execSql(sql) {
  const url = `https://api.supabase.com/v1/projects/${REF}/database/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok && res.status !== 201) {
    throw new Error(`SQL API ${res.status}: ${text}`)
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function verifyGoneViaSql() {
  const chk = await execSql("select to_regclass('public.teste') as reg;")
  const gone = Array.isArray(chk) && chk[0] && (chk[0].reg === null)
  if (!gone) throw new Error('Tabela ainda existe segundo to_regclass')
}

async function verifyGoneViaRest() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('[WARN] Não foi possível verificar via REST (faltam SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY).')
    return
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await sb.from('teste').select('*').limit(1)
  if (!error) throw new Error('REST ainda conseguiu selecionar a tabela teste')
  if (!/(relation|table).*does not exist/i.test(error.message) && !/Could not find the table/i.test(error.message)) {
    throw new Error(`Mensagem inesperada ao verificar REST: ${error.message}`)
  }
}

async function main() {
  console.log('[INFO] Dropando tabela public.teste ...')
  await execSql('DROP TABLE IF EXISTS public.teste;')
  console.log('[OK] DROP executado.')
  await verifyGoneViaSql()
  console.log('[INFO] SQL: to_regclass retornou NULL (tabela removida)')
  try {
    await verifyGoneViaRest()
    console.log('[INFO] REST: confirmação de remoção bem-sucedida')
  } catch (e) {
    console.log('[WARN] REST check:', e.message)
  }
}

main().catch((e) => {
  console.error('[FAIL]', e?.message || e)
  process.exit(2)
})

