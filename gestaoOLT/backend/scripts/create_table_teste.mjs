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

async function verifyViaRest() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('[WARN] Não foi possível verificar via REST (faltam SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY).')
    return
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await sb.from('teste').select('*').limit(1)
  if (error) throw new Error(`Falha verificando via REST: ${error.message}`)
}

async function main() {
  console.log('[INFO] Criando tabela public.teste (sem colunas, sem RLS) ...')
  try {
    // Tenta em uma única chamada
    await execSql('CREATE TABLE IF NOT EXISTS public.teste (); ALTER TABLE public.teste DISABLE ROW LEVEL SECURITY;')
  } catch (e) {
    // Alguns ambientes exigem statements separados
    await execSql('CREATE TABLE IF NOT EXISTS public.teste ();')
    await execSql('ALTER TABLE public.teste DISABLE ROW LEVEL SECURITY;')
  }
  console.log('[OK] DDL aplicado.')

  // Verificação via SQL API
  const chk = await execSql("select to_regclass('public.teste') as reg;")
  const exists = Array.isArray(chk) && chk[0] && (chk[0].reg !== null)
  console.log(`[INFO] Existência via SQL API: ${exists ? 'OK' : 'NÃO ENCONTRADA'}`)

  // Verificação via REST (se possível)
  try {
    await verifyViaRest()
    console.log('[INFO] REST: select em public.teste executado com sucesso')
  } catch (e) {
    console.log('[WARN] REST check falhou:', e.message)
  }
}

main().catch((e) => {
  console.error('[FAIL]', e?.message || e)
  process.exit(2)
})

