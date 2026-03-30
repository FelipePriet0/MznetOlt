// List core tables via Supabase MCP execute_sql
const URL = process.env.MCP_URL || "https://mcp.supabase.com/mcp?project_ref=cnyglvhnnyssnviljptr";
const TOKEN = process.env.SUPABASE_MCP_TOKEN;
if (!TOKEN) { console.error("Missing SUPABASE_MCP_TOKEN"); process.exit(2); }

async function rpc(method, params, id = 1) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json, text/event-stream",
    "user-agent": "codex-cli/0.1 (+mcp-client)",
    authorization: `Bearer ${TOKEN}`,
  };
  const res = await fetch(URL, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 400)}`); }
  if (!res.ok || data.error) {
    const msg = data?.error?.message || res.statusText || text;
    const code = data?.error?.code || res.status;
    throw new Error(`RPC error ${code}: ${msg}`);
  }
  return data.result;
}

(async () => {
  await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "codex-cli", version: "0.1.0" } }, 1);
  const sql = "select table_name from information_schema.tables where table_schema='public' and table_name in ('olts','boards','pon_ports','onus') order by table_name";
  let res;
  try {
    res = await rpc("tools/call", { name: "execute_sql", arguments: { sql } }, 2);
  } catch (e) {
    // fallback to "query" arg name
    res = await rpc("tools/call", { name: "execute_sql", arguments: { query: sql } }, 3);
  }
  console.log(JSON.stringify(res, null, 2));
})().catch(err => { console.error(err.message); process.exit(1); });
