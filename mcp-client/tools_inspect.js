// Inspect MCP tools and run schema queries using same pattern as index.js
const DEFAULT_URL = process.env.MCP_URL || "https://mcp.supabase.com/mcp?project_ref=cnyglvhnnyssnviljptr";
const TOKEN = process.env.SUPABASE_MCP_TOKEN;
if (!TOKEN) { console.error("Missing SUPABASE_MCP_TOKEN"); process.exit(2); }

let SESSION_ID;

async function rpcCall(method, params, { id = 1, url = DEFAULT_URL, token = TOKEN } = {}) {
  const payload = { jsonrpc: "2.0", id, method, params };
  const headers = {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json, text/event-stream",
    "user-agent": "codex-cli/0.1 (+mcp-client)",
  };
  if (token) headers["authorization"] = `Bearer ${token}`;
  if (SESSION_ID) headers["mcp-session-id"] = SESSION_ID;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 400)}`); }
  if (!res.ok || data.error) {
    const msg = data?.error?.message || res.statusText || text;
    const code = data?.error?.code || res.status;
    throw new Error(`RPC error ${code}: ${msg}`);
  }
  return data.result;
}

(async () => {
  // initialize and capture session header
  {
    const payload = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "codex-cli", version: "0.1.0" } } };
    const headers = {
      "content-type": "application/json; charset=utf-8",
      accept: "application/json, text/event-stream",
      "user-agent": "codex-cli/0.1 (+mcp-client)",
    };
    if (TOKEN) headers["authorization"] = `Bearer ${TOKEN}`;
    const res = await fetch(DEFAULT_URL, { method: "POST", headers, body: JSON.stringify(payload) });
    SESSION_ID = res.headers.get("mcp-session-id") || SESSION_ID;
    const text = await res.text();
    const init = JSON.parse(text).result;
    console.log("Init:", { name: init?.serverInfo?.name, version: init?.serverInfo?.version });
  }

  const tools = await rpcCall("tools/list", undefined, { id: 2 });
  const exec = (tools.tools || []).find(t => t.name === "execute_sql");
  console.log("execute_sql tool:");
  console.log(JSON.stringify(exec, null, 2));

  // Run schema queries using execute_sql
  async function sql(q, id) {
    return await rpcCall("tools/call", { name: "execute_sql", arguments: { query: q } }, { id });
  }

  const qTables = "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name";
  const qColumns = "select table_name, column_name, data_type, is_nullable, column_default, ordinal_position from information_schema.columns where table_schema='public' order by table_name, ordinal_position";

  const tRes = await sql(qTables, 10);
  console.log("tables:");
  console.log(JSON.stringify(tRes, null, 2));

  const cRes = await sql(qColumns, 12);
  console.log("columns:");
  console.log(JSON.stringify(cRes, null, 2));
})().catch(e => { console.error(e.message); process.exit(1); });
