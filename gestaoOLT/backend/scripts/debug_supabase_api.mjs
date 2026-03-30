const PAT = process.env.SUPABASE_ACCESS_TOKEN
const REF = process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF || 'cnyglvhnnyssnviljptr'
if (!PAT) {
  console.error('Set SUPABASE_ACCESS_TOKEN')
  process.exit(1)
}

async function tryEndpoint(path) {
  const url = `https://api.supabase.com${path}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } })
  const text = await res.text()
  console.log(`\n[${res.status}] ${path}`)
  try {
    const json = JSON.parse(text)
    // Simple redaction
    const redacted = JSON.stringify(json, (k, v) => (k.toLowerCase().includes('password') ? '***' : v), 2)
    console.log(redacted)
  } catch {
    console.log(text)
  }
}

const paths = [
  `/v1/projects/${REF}`,
  `/v1/projects`,
  `/v1/projects/${REF}/database`,
  `/v1/projects/${REF}/db/credentials`,
  `/v1/projects/${REF}/db/connection-string`,
  `/v1/projects/${REF}/config`,
]

for (const p of paths) {
  try {
    await tryEndpoint(p)
  } catch (e) {
    console.log(`[ERR] ${p}:`, e.message)
  }
}

