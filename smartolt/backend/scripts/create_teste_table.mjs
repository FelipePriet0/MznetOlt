import 'dotenv/config'
import { Client } from 'pg'

const PROJECT_REF = process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF || 'cnyglvhnnyssnviljptr'
const PAT = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_PAT || process.env.SUPABASE_TOKEN

if (!PAT) {
  console.error('[FAIL] Forneça o token via SUPABASE_ACCESS_TOKEN')
  process.exit(1)
}

async function getDbConfig() {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Management API error ${res.status}: ${text}`)
  }
  const json = await res.json()
  // Estruturas comuns: json.database.{host,password,port,user}
  const db = json.database || {}
  const host = db.host || `db.${PROJECT_REF}.supabase.co`
  const port = db.port || 5432
  const user = db.user || 'postgres'
  const password = db.password
  const database = db.name || 'postgres'
  if (!password) throw new Error('Senha do banco não retornada pela API')
  return { host, port, user, password, database }
}

async function main() {
  console.log(`[INFO] Buscando credenciais do banco para ${PROJECT_REF}`)
  const cfg = await getDbConfig()
  const client = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  try {
    await client.query('CREATE TABLE IF NOT EXISTS public.teste ();')
    await client.query('ALTER TABLE public.teste DISABLE ROW LEVEL SECURITY;')
    console.log('[OK] Tabela public.teste criada/verificada e RLS desativado')
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error('[FAIL]', e?.message || e)
  process.exit(2)
})

