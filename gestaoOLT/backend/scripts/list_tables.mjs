import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('[FAIL] Variáveis ausentes: verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log(`[INFO] Listando tabelas em ${url}`)

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

try {
  const { data, error } = await supabase
    .schema('pg_meta')
    .from('tables')
    .select('schema,name')
    .order('schema', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('[FAIL] Erro ao consultar pg_meta.tables:', error.message)
    process.exit(2)
  }

  // Agrupar por schema
  const grouped = data.reduce((acc, row) => {
    if (!acc[row.schema]) acc[row.schema] = []
    acc[row.schema].push(row.name)
    return acc
  }, /** @type {Record<string,string[]>} */ ({}))

  // Imprimir schemas e tabelas
  for (const schema of Object.keys(grouped).sort()) {
    console.log(`\nSchema: ${schema}`)
    for (const name of grouped[schema]) {
      console.log(` - ${name}`)
    }
  }
} catch (e) {
  console.error('[FAIL] Exceção ao listar tabelas:', e?.message || e)
  process.exit(3)
}

