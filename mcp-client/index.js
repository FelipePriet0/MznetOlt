// Minimal MCP HTTP JSON-RPC client for Supabase MCP endpoint
// Uses native fetch (Node 18+). No external deps.

const DEFAULT_URL =
  process.env.MCP_URL ||
  "https://mcp.supabase.com/mcp?project_ref=cnyglvhnnyssnviljptr";

const TOKEN = process.env.SUPABASE_MCP_TOKEN;

let SESSION_ID = undefined;

async function rpcCall(method, params, { id = 1, url = DEFAULT_URL, token = TOKEN } = {}) {
  const payload = { jsonrpc: "2.0", id, method, params };
  const headers = {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json, text/event-stream",
    "user-agent": "codex-cli/0.1 (+mcp-client)",
  };
  if (token) headers["authorization"] = `Bearer ${token}`;
  if (SESSION_ID) headers["mcp-session-id"] = SESSION_ID;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 400)}`);
  }

  if (!res.ok || data.error) {
    const msg = data?.error?.message || res.statusText || text;
    const code = data?.error?.code || res.status;
    throw new Error(`RPC error ${code}: ${msg}`);
  }

  return data.result;
}

async function rpcNotify(method, params, { url = DEFAULT_URL, token = TOKEN } = {}) {
  const payload = { jsonrpc: "2.0", method, params };
  const headers = {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json, text/event-stream",
    "user-agent": "codex-cli/0.1 (+mcp-client)",
  };
  if (token) headers["authorization"] = `Bearer ${token}`;
  if (SESSION_ID) headers["mcp-session-id"] = SESSION_ID;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  // Notifications don't require a response body; treat non-2xx as error for visibility.
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notify error ${res.status}: ${text || res.statusText}`);
  }
}

async function main() {
  const url = DEFAULT_URL;
  if (!TOKEN) {
    console.error(
      "Missing SUPABASE_MCP_TOKEN env var. Export it before running this script."
    );
    process.exit(2);
  }

  console.log(`Connecting to MCP at: ${url}`);
  let id = 1;

  // 1) initialize (capture potential session id header)
  const initParams = {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "codex-cli", version: "0.1.0" },
  };
  // do a manual initialize to read headers
  {
    const payload = { jsonrpc: "2.0", id: id, method: "initialize", params: initParams };
    const headers = {
      "content-type": "application/json; charset=utf-8",
      accept: "application/json, text/event-stream",
      "user-agent": "codex-cli/0.1 (+mcp-client)",
    };
    if (TOKEN) headers["authorization"] = `Bearer ${TOKEN}`;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    SESSION_ID =
      res.headers.get("mcp-session-id") ||
      res.headers.get("x-session-id") ||
      res.headers.get("X-Session-Id") ||
      undefined;
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 400)}`);
    }
    if (!res.ok || data.error) {
      const msg = data?.error?.message || res.statusText || text;
      const code = data?.error?.code || res.status;
      throw new Error(`RPC error ${code}: ${msg}`);
    }
    id++;
    var init = data.result;
  }
  console.log("Initialized:", {
    name: init?.serverInfo?.name,
    version: init?.serverInfo?.version,
    protocol: init?.protocolVersion,
  });
  if (process.env.DEBUG) {
    console.log("Init raw:", JSON.stringify(init));
    console.log("Session:", SESSION_ID || "<none>");
  }

  // Send 'initialized' notification as in LSP-style protocols
  try {
    await rpcNotify("initialized", {});
  } catch (e) {
    if (process.env.DEBUG) console.log("initialized notify failed:", e.message);
  }

  // 2) list tools (try common method name variants)
  const methodCandidates = [
    "tools/list",
    "tools.list",
    "list_tools",
    "listTools",
  ];
  let tools;
  let lastErr;
  for (const m of methodCandidates) {
    try {
      tools = await rpcCall(m, undefined, { id: id++ });
      console.log(`tools listed via method: ${m}`);
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!tools) {
    // try resources/list to at least prove access
    try {
      const resList = await rpcCall("resources/list", undefined, { id: id++ });
      console.log(
        `tools/list not available; resources/list succeeded with ${
          resList?.resources?.length || 0
        } resources.`
      );
    } catch {}
    throw lastErr || new Error("Unable to list tools");
  }

  const toolItems = tools?.tools || [];
  console.log(`Tools (${toolItems.length}):`);
  for (const t of toolItems) {
    console.log(`- ${t.name}${t.description ? ": " + t.description : ""}`);
  }

  // 3) Verify write access via a safe TEMP table write, if execute_sql is available
  const hasExecute = toolItems.some((t) => t.name === "execute_sql");
  if (hasExecute) {
    try {
      const createRes = await rpcCall(
        "tools/call",
        { name: "execute_sql", arguments: { sql: "CREATE TEMP TABLE mcp_access_check_tmp(id int);" } },
        { id: id++ }
      );
      console.log("Write check (CREATE TEMP TABLE): success");

      // Attempt to drop, may no-op if new session
      try {
        await rpcCall(
          "tools/call",
          { name: "execute_sql", arguments: { sql: "DROP TABLE IF EXISTS mcp_access_check_tmp;" } },
          { id: id++ }
        );
        console.log("Cleanup (DROP TEMP TABLE): attempted");
      } catch (e) {
        console.log("Cleanup skip:", e.message);
      }
    } catch (e) {
      console.log("Write check failed:", e.message);
    }
  } else {
    console.log("execute_sql tool not available; skipping write check");
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
