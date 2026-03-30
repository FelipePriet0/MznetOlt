/**
 * Seed de dados fake para teste da feature Portas PON (e demais telas).
 *
 * Cria:
 *   - 2 locations
 *   - 2 zones
 *   - 2 OLTs (Huawei + ZTE)
 *   - 2 boards por OLT (4 boards total)
 *   - 4 PON ports por board (16 portas total)
 *   - 8 a 12 ONUs por porta PON (mix de online/offline)
 */

const PAT = 'sbp_42de7f2c028f081c6320e08f1ad759751994a372'
const REF = 'cnyglvhnnyssnviljptr'

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`SQL error [${res.status}]: ${text}`)
  return JSON.parse(text)
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function signal() { return (-(rand(180, 290) / 10)).toFixed(1) }  // -18.0 a -29.0 dBm

const VENDORS_ONU = ['Huawei', 'ZTE', 'Fiberhome', 'Nokia']
const MODELS_ONU  = ['HG8245H', 'F670L', 'AN5506-04', 'G-010G-P']
const STATUSES    = ['online', 'online', 'online', 'online', 'online', 'offline', 'offline', 'loss_signal']
const MODES       = ['bridge', 'router', 'bridge', 'router', 'bridge']

// ────────────────────────────────────────────────────────────────
// 1. Limpar dados existentes (na ordem inversa das FK)
// ────────────────────────────────────────────────────────────────
console.log('🧹 Limpando dados existentes...')
// Dependentes de onus
await query(`DELETE FROM ticket_events`)
await query(`DELETE FROM diagnostic_tickets`)
await query(`DELETE FROM network_events`)
await query(`DELETE FROM onu_network_snapshots`)
// onus (ethernet_ports tem CASCADE)
await query(`DELETE FROM onus`)
await query(`DELETE FROM pon_ports`)
await query(`DELETE FROM boards`)
// dependentes de olts com CASCADE: uplink_ports, olt_history, olt_backups, network_sync_runs
await query(`DELETE FROM network_sync_runs`)
await query(`DELETE FROM olts`)
await query(`DELETE FROM locations`)
await query(`DELETE FROM zones`)
console.log('✓ Limpo.\n')

// ────────────────────────────────────────────────────────────────
// 2. Locations
// ────────────────────────────────────────────────────────────────
console.log('📍 Criando locations...')
const locsResult = await query(`
  INSERT INTO locations (name) VALUES
    ('Centro'), ('Bairro Norte')
  RETURNING id, name
`)
const locs = locsResult
console.log('  Locations:', locs.map(l => `${l.name}(${l.id})`).join(', '))

// ────────────────────────────────────────────────────────────────
// 3. Zones
// ────────────────────────────────────────────────────────────────
console.log('🗺️  Criando zones...')
const zonesResult = await query(`
  INSERT INTO zones (name) VALUES
    ('Zona Central'), ('Zona Norte')
  RETURNING id, name
`)
const zones = zonesResult
console.log('  Zones:', zones.map(z => `${z.name}(${z.id})`).join(', '))

// ────────────────────────────────────────────────────────────────
// 4. OLTs
// ────────────────────────────────────────────────────────────────
console.log('\n📡 Criando OLTs...')
const oltsResult = await query(`
  INSERT INTO olts (name, vendor, mgmt_ip, location_id, zone_id, tcp_port, telnet_user, telnet_password, snmp_ro_community, snmp_rw_community, snmp_udp_port, pon_type, hw_version)
  VALUES
    ('OLT-CENTRO-01', 'Huawei', '192.168.1.1', ${locs[0].id}, ${zones[0].id}, 23, 'admin', 'huawei123', 'public', 'private', 161, 'GPON', 'MA5800-X7'),
    ('OLT-NORTE-01',  'ZTE',    '192.168.2.1', ${locs[1].id}, ${zones[1].id}, 23, 'admin', 'zte456',   'public', 'private', 161, 'GPON', 'ZXA10 C300')
  RETURNING id, name, vendor
`)
const olts = oltsResult
console.log('  OLTs:', olts.map(o => `${o.name}(${o.id})`).join(', '))

// ────────────────────────────────────────────────────────────────
// 5. Boards (2 por OLT)
// ────────────────────────────────────────────────────────────────
console.log('\n🖥️  Criando boards...')
const boardRows = []
for (const olt of olts) {
  const isHuawei = olt.vendor === 'Huawei'
  for (let slot = 0; slot < 2; slot++) {
    boardRows.push({
      olt_id:        olt.id,
      slot_index:    slot,
      name:          `Slot ${slot}`,
      board_type:    isHuawei ? 'H805GPFD' : 'GTGO',
      board_hw_id:   isHuawei ? `HUA-${rand(1000,9999)}` : `ZTE-${rand(1000,9999)}`,
      board_status:  'Normal',
      board_role:    'Normal',
      terminal_count: 128,
    })
  }
}

const boardInsert = boardRows.map(b =>
  `(${b.olt_id}, ${b.slot_index}, '${b.name}', '${b.board_type}', '${b.board_hw_id}', '${b.board_status}', '${b.board_role}', ${b.terminal_count})`
).join(',\n  ')

const boardsResult = await query(`
  INSERT INTO boards (olt_id, slot_index, name, board_type, board_hw_id, board_status, board_role, terminal_count)
  VALUES ${boardInsert}
  RETURNING id, olt_id, slot_index, name
`)
const boards = boardsResult
console.log('  Boards:', boards.map(b => `${b.name}@olt${b.olt_id}(${b.id})`).join(', '))

// ────────────────────────────────────────────────────────────────
// 6. PON Ports (4 por board)
// ────────────────────────────────────────────────────────────────
console.log('\n🔌 Criando portas PON...')
const ponRows = []
for (const board of boards) {
  for (let idx = 0; idx < 4; idx++) {
    ponRows.push({
      board_id:          board.id,
      pon_index:         idx,
      name:              `PON ${idx}`,
      admin_state:       idx === 3 ? 'disabled' : 'enabled',
      description:       idx === 0 ? 'Fibra principal' : idx === 1 ? 'Ramal norte' : '',
      min_range_meters:  0,
      max_range_meters:  20000,
    })
  }
}

const ponInsert = ponRows.map(p =>
  `(${p.board_id}, ${p.pon_index}, '${p.name}', '${p.admin_state}', ${p.description ? `'${p.description}'` : 'NULL'}, ${p.min_range_meters}, ${p.max_range_meters})`
).join(',\n  ')

const portsResult = await query(`
  INSERT INTO pon_ports (board_id, pon_index, name, admin_state, description, min_range_meters, max_range_meters)
  VALUES ${ponInsert}
  RETURNING id, board_id, pon_index, name
`)
const ports = portsResult
console.log(`  ${ports.length} portas PON criadas.`)

// ────────────────────────────────────────────────────────────────
// 7. ONUs (8-12 por porta)
// ────────────────────────────────────────────────────────────────
console.log('\n📟 Criando ONUs...')

const VENDOR_PREFIXES = ['HWTC', 'ZTEG', 'FHTT', 'ALKL']

const boardById = Object.fromEntries(boards.map(b => [b.id, b]))

const onuValues = []
const serialsSeen = new Set()

for (const port of ports) {
  const board = boardById[port.board_id]
  const count = rand(8, 12)

  for (let i = 0; i < count; i++) {
    const status = pick(STATUSES)
    const sig    = status === 'online' ? signal() : null
    const prefix = pick(VENDOR_PREFIXES)

    let serial
    do {
      const hex = rand(0x10000000, 0xFFFFFFFF).toString(16).toUpperCase()
      serial = `${prefix}${hex}`
    } while (serialsSeen.has(serial))
    serialsSeen.add(serial)

    onuValues.push(
      `('${serial}', ${board.olt_id}, ${port.board_id}, ${port.id}, '${status}', 'enabled', ${sig ?? 'NULL'}, ${status === 'online' ? `now() - interval '${rand(1,120)} minutes'` : 'NULL'}, '${pick(MODES)}', ${rand(10,4094)}, '${rand(10,100)}M', '${rand(5,50)}M')`
    )
  }
}

// Insere em lotes de 50
const batchSize = 50
let total = 0
for (let i = 0; i < onuValues.length; i += batchSize) {
  const batch = onuValues.slice(i, i + batchSize)
  await query(`
    INSERT INTO onus (serial_number, olt_id, board_id, pon_port_id, status, admin_state, last_known_signal, last_seen_at, mode, vlan_id, download_profile, upload_profile)
    VALUES ${batch.join(',\n    ')}
  `)
  total += batch.length
  process.stdout.write(`\r  ${total}/${onuValues.length} ONUs inseridas...`)
}
console.log(`\n  ✓ ${total} ONUs criadas.`)

// ────────────────────────────────────────────────────────────────
// 8. Uplink Ports (2-3 por OLT)
// ────────────────────────────────────────────────────────────────
console.log('\n🔗 Criando Uplink Ports...')

const uplinkDefs = [
  // OLT-CENTRO-01 (Huawei): 3 uplinks
  { olt_idx: 0, name: 'GE0/0/0', fiber: 'Fibra Tronco A', admin_state: 'Habilitado', status: 'Habilitado', negotiation: '1000M-Full', mtu: 1500, duplex: 'Full', pvid: 100, vlan_mode: 'Trunk', tagged_vlans: '100,200,300', description: 'Uplink principal operadora' },
  { olt_idx: 0, name: 'GE0/0/1', fiber: 'Fibra Tronco B', admin_state: 'Habilitado', status: 'Habilitado', negotiation: '1000M-Full', mtu: 1500, duplex: 'Full', pvid: 100, vlan_mode: 'Trunk', tagged_vlans: '100,200',     description: 'Uplink redundante' },
  { olt_idx: 0, name: 'GE0/0/2', fiber: null,             admin_state: 'Desabilitado', status: 'Desabilitado', negotiation: 'Auto', mtu: 1500, duplex: 'Auto', pvid: 1, vlan_mode: 'Porta', tagged_vlans: null, description: 'Reserva' },
  // OLT-NORTE-01 (ZTE): 2 uplinks
  { olt_idx: 1, name: 'xge-0/1/0', fiber: 'Fibra Norte Principal', admin_state: 'Habilitado', status: 'Habilitado', negotiation: '10G-Full', mtu: 9000, duplex: 'Full', pvid: 200, vlan_mode: 'Trunk', tagged_vlans: '200,300,400,500', description: 'Uplink 10G principal' },
  { olt_idx: 1, name: 'xge-0/1/1', fiber: 'Fibra Norte Backup',   admin_state: 'Habilitado', status: 'Desabilitado', negotiation: '10G-Full', mtu: 9000, duplex: 'Full', pvid: 200, vlan_mode: 'Trunk', tagged_vlans: '200,300', description: 'Uplink 10G backup' },
]

const uplinkRows = uplinkDefs.map(u => {
  const olt = olts[u.olt_idx]
  const fiber   = u.fiber    ? `'${u.fiber}'`    : 'NULL'
  const tagged  = u.tagged_vlans ? `'${u.tagged_vlans}'` : 'NULL'
  const desc    = u.description  ? `'${u.description}'`  : 'NULL'
  return `(${olt.id}, '${u.name}', ${fiber}, '${u.admin_state}', '${u.status}', '${u.negotiation}', ${u.mtu}, '${u.duplex}', ${u.pvid}, '${u.vlan_mode}', ${tagged}, ${desc})`
}).join(',\n  ')

const uplinksResult = await query(`
  INSERT INTO uplink_ports (olt_id, name, fiber, admin_state, status, negotiation, mtu, duplex, pvid, vlan_mode, tagged_vlans, description)
  VALUES ${uplinkRows}
  RETURNING id, olt_id, name
`)
console.log(`  ${uplinksResult.length} uplink ports criadas.`)

// ────────────────────────────────────────────────────────────────
// Resumo final
// ────────────────────────────────────────────────────────────────
console.log('\n✅ Seed concluído!')
console.log(`   ${locs.length} locations`)
console.log(`   ${zones.length} zones`)
console.log(`   ${olts.length} OLTs`)
console.log(`   ${boards.length} boards`)
console.log(`   ${ports.length} PON ports`)
console.log(`   ${total} ONUs`)
console.log(`   ${uplinksResult.length} uplink ports`)
console.log('\nAgora abra o sistema e navegue para OLTs → Uplink para testar!')
