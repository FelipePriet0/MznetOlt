import { readFileSync } from 'fs'
import { join } from 'path'

const PAT = 'sbp_42de7f2c028f081c6320e08f1ad759751994a372'
const REF = 'cnyglvhnnyssnviljptr'
const BASE = 'C:/Users/studi/Downloads/mznetolt/smartolt/infrastructure/database/migrations'

const migrations = [
  '0013_add_pon_ports_description.sql',
  '0029_add_pon_ports_config_fields.sql',
]

for (const file of migrations) {
  const sql = readFileSync(join(BASE, file), 'utf8')
  console.log(`\n→ Rodando ${file}...`)

  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  const text = await res.text()
  if (res.ok) {
    console.log(`✓ OK`)
  } else {
    console.error(`✗ ERRO [${res.status}]: ${text}`)
    process.exit(1)
  }
}

console.log('\n✓ Todas as migrations aplicadas com sucesso.')
