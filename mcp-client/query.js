// Minimal helper to run execute_sql via Supabase MCP and print results
const URL = process.env.MCP_URL || "https://mcp.supabase.com/mcp?project_ref=cnyglvhnnyssnviljptr";
const TOKEN = process.env.SUPABASE_MCP_TOKEN;
const SQL = process.env.SQL || process.argv.slice(2).join(" ");

if (!TOKEN) {
  console.error("Missing SUPABASE_MCP_TOKEN env var");
  process.exit(2);
}
if (!SQL) {
  console.error("Usage: SQL='select ...' node mcp-client/query.js");
  process.exit(2);
}

let SESSION_ID;

async function rpc(method, params, id = 1) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json, text/event-stream",
    "user-agent": "codex-cli/0.1 (+mcp-client)",
    authorization: `Bearer ${TOKEN}`,
  };
  if (SESSION_ID) headers["mcp-session-id"] = SESSION_ID;
  const res = await fetch(URL, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON response (${res.status}): ${text.slice(0,400)}`); }
  if (!res.ok || data.error) {
    const msg = data?.error?.message || res.statusText || text;
    const code = data?.error?.code || res.status;
    throw new Error(`RPC error ${code}: ${msg}`);
  }
  return data.result;
}

(async () => {
  // initialize to obtain session
  const headers = {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json, text/event-stream",
    "user-agent": "codex-cli/0.1 (+mcp-client)",
    authorization: `Bearer ${TOKEN}`,
  };
  const initRes = await fetch(URL, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "codex-cli", version: "0.1.0" } } }) });
  SESSION_ID = initRes.headers.get("mcp-session-id");
  const initText = await initRes.text();
  const initJson = JSON.parse(initText);
  if (!initRes.ok || initJson.error) throw new Error(`init failed: ${initText}`);

  const result = await rpc("tools/call", { name: "execute_sql", arguments: { query: SQL } }, 2);
  console.log(JSON.stringify(result, null, 2));
})().catch(err => { console.error(err.message); process.exit(1); });
