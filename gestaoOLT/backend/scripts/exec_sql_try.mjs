const PAT = process.env.SUPABASE_ACCESS_TOKEN
const REF = process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF || 'cnyglvhnnyssnviljptr'
if (!PAT) {
  console.error('Set SUPABASE_ACCESS_TOKEN')
  process.exit(1)
}

const SQL = process.env.SQL || 'select 1 as ok;'

async function tryPost(path) {
  const url = `https://api.supabase.com${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  })
  const text = await res.text()
  console.log(`\n[${res.status}] POST ${path}`)
  console.log(text.slice(0, 400))
}

const paths = [
  `/v1/projects/${REF}/sql`,
  `/v1/sql/${REF}`,
  `/v1/query/${REF}`,
  `/v1/projects/${REF}/query`,
  `/v1/projects/${REF}/database/query`,
  `/v1/projects/${REF}/db/query`,
  `/v1/pgsql/${REF}/query`,
]

for (const p of paths) {
  try {
    await tryPost(p)
  } catch (e) {
    console.log(`[ERR] ${p}:`, e.message)
  }
}

