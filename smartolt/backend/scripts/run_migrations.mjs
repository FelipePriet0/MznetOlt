import { readFileSync } from 'fs'
import { join } from 'path'

const PAT = 'sbp_42de7f2c028f081c6320e08f1ad759751994a372'
const REF = 'cnyglvhnnyssnviljptr'
const BASE = 'C:/Users/studi/Downloads/mznetolt/smartolt/infrastructure/database/migrations'

const migrations = [
  '0019_create_diagnostic_rules.sql',
  '0020_create_diagnostic_tickets.sql',
  '0021_create_ticket_events.sql',
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
