// Dump public schema tables, columns, PKs, and FKs via Supabase MCP
const URL = process.env.MCP_URL || "https://mcp.supabase.com/mcp?project_ref=cnyglvhnnyssnviljptr";
const TOKEN = process.env.SUPABASE_MCP_TOKEN;
if (!TOKEN) { console.error("Missing SUPABASE_MCP_TOKEN"); process.exit(2); }

let SESSION_ID;

async function http(method, params, id = 1, { captureSession = false } = {}) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json, text/event-stream",
    "user-agent": "codex-cli/0.1 (+mcp-client)",
    authorization: `Bearer ${TOKEN}`,
  };
  if (SESSION_ID) headers["mcp-session-id"] = SESSION_ID;
  const res = await fetch(URL, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  if (captureSession) {
    SESSION_ID =
      res.headers.get("mcp-session-id") ||
      res.headers.get("x-session-id") ||
      res.headers.get("X-Session-Id") ||
      SESSION_ID;
  }
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

async function execSQL(sql, id) {
  try {
    return await http("tools/call", { name: "execute_sql", arguments: { sql } }, id);
  } catch (e) {
    return await http("tools/call", { name: "execute_sql", arguments: { query: sql } }, id + 1);
  }
}

(async () => {
  // Initialize and capture session
  const init = await http(
    "initialize",
    { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "codex-cli", version: "0.1.0" } },
    1,
    { captureSession: true }
  );

  const qTables = "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name";
  const qColumns = "select table_name, column_name, data_type, is_nullable, column_default, ordinal_position from information_schema.columns where table_schema='public' order by table_name, ordinal_position";
  const qPKs = `
    select c.relname as table, a.attname as column
    from pg_index i
    join pg_class c on c.oid = i.indrelid
    join pg_attribute a on a.attrelid = c.oid and a.attnum = any(i.indkey)
    where i.indisprimary
    order by c.relname, a.attname`;
  const qFKs = `
    select
      c.conname as constraint,
      (c.conrelid::regclass)::text as table,
      a.attname as column,
      (c.confrelid::regclass)::text as ref_table,
      af.attname as ref_column
    from pg_constraint c
    join lateral unnest(c.conkey) with ordinality as k(attnum, ord) on true
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum
    join lateral unnest(c.confkey) with ordinality as fk(attnum, ord) on fk.ord = k.ord
    join pg_attribute af on af.attrelid = c.confrelid and af.attnum = fk.attnum
    where c.contype = 'f'
    order by table, column`;

  const [tables, columns, pks, fks] = await Promise.all([
    execSQL(qTables, 2),
    execSQL(qColumns, 4),
    execSQL(qPKs, 6),
    execSQL(qFKs, 8),
  ]);

  console.log(JSON.stringify({ init, tables, columns, pks, fks }, null, 2));
})().catch(err => { console.error(err.message); process.exit(1); });

