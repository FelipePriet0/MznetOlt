#!/usr/bin/env node
// Simple CSV fixer: maps PT headers to staging columns and pads rows to fixed width.
// Usage: node scripts/fix_csv.js <input.csv> [output.csv]

const fs = require('fs')
const path = require('path')

// Expected columns in import_onus_staging (order matters)
const TARGET_HEADERS = [
  'onu_external_id',
  'pon_type',
  'sn',
  'onu_type',
  'name',
  'olt',
  'board',
  'port',
  'allocated_onu',
  'zone',
  'address',
  'latitude',
  'longitude',
  'odb_splitter',
  'odb_port',
  'mode',
  'wan_mode',
  'ip_address',
  'subnet_mask',
  'default_gateway',
  'dns1',
  'dns2',
  'username',
  'password',
  'catv',
  'administrative_status',
  'auth_date',
  'status',
  'signal_category',
  'signal_1310',
  'signal_1490',
  'distance_m',
  'service_port',
  'service_port_vlan',
  'service_port_cvlan',
  'service_port_svlan',
  'service_port_tag_transform_mode',
  'service_port_upload_speed',
  'service_port_download_speed',
  'contact',
  'tr069_profile',
  'tr069_device_id',
]

// Map Portuguese headers to staging columns
const PT_TO_EN = new Map([
  ['ID externo da ONU', 'onu_external_id'],
  ['Tipo de PON', 'pon_type'],
  ['SN', 'sn'],
  ['Tipo de ONU', 'onu_type'],
  ['Nome', 'name'],
  ['OLT', 'olt'],
  ['Placa', 'board'],
  ['Porta', 'port'],
  ['ONU alocada', 'allocated_onu'],
  ['Zona', 'zone'],
  ['Endereço', 'address'],
  ['Latitude', 'latitude'],
  ['Longitude', 'longitude'],
  ['ODB (Divisor)', 'odb_splitter'],
  ['Porta ODB', 'odb_port'],
  ['Modo', 'mode'],
  ['Modo WAN', 'wan_mode'],
  ['Endereço IP', 'ip_address'],
  ['Máscara de sub-rede', 'subnet_mask'],
  ['Gateway padrão', 'default_gateway'],
  ['DNS1', 'dns1'],
  ['DNS2', 'dns2'],
  ['Nome de usuário', 'username'],
  ['Senha', 'password'],
  ['CATV', 'catv'],
  ['Status administrativo', 'administrative_status'],
  ['Data de autenticação', 'auth_date'],
  ['Status', 'status'],
  ['Sinal', 'signal_category'],
  ['Sinal 1310', 'signal_1310'],
  ['Sinal 1490', 'signal_1490'],
  ['Distância (m)', 'distance_m'],
  ['Porta de serviço', 'service_port'],
  ['VLAN da porta de serviço', 'service_port_vlan'],
  ['CVLAN da porta de serviço', 'service_port_cvlan'],
  ['SVLAN da porta de serviço', 'service_port_svlan'],
  ['Modo de transformação de tag da porta de serviço', 'service_port_tag_transform_mode'],
  ['Velocidade de upload da porta de serviço', 'service_port_upload_speed'],
  ['Velocidade de download da porta de serviço', 'service_port_download_speed'],
  ['Contato', 'contact'],
  ['Perfil TR069', 'tr069_profile'],
  ['ID do dispositivo TR069', 'tr069_device_id'],
  // fallback to English headers if they are present
  ['ONU external ID', 'onu_external_id'],
  ['PON Type', 'pon_type'],
  ['Onu Type', 'onu_type'],
  ['Allocated ONU', 'allocated_onu'],
  ['ODB (Splitter)', 'odb_splitter'],
  ['WAN mode', 'wan_mode'],
  ['IP address', 'ip_address'],
  ['Subnet mask', 'subnet_mask'],
  ['Default gateway', 'default_gateway'],
  ['Service port VLAN', 'service_port_vlan'],
  ['Service port CVLAN', 'service_port_cvlan'],
  ['Service port SVLAN', 'service_port_svlan'],
  ['Service port tag transform mode', 'service_port_tag_transform_mode'],
  ['Service port upload speed', 'service_port_upload_speed'],
  ['Service port download speed', 'service_port_download_speed'],
  ['TR069 Profile', 'tr069_profile'],
  ['TR069 Device ID', 'tr069_device_id'],
])

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        cur += '"'; i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function quoteCsvField(v) {
  if (v == null) v = ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function main() {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: node scripts/fix_csv.js <input.csv> [output.csv]')
    process.exit(1)
  }
  const outPath = process.argv[3] || path.join(path.dirname(input), path.basename(input, path.extname(input)) + '_fixed.csv')
  const raw = fs.readFileSync(input, 'utf8')
  const lines = raw.split(/\r?\n/).filter(l => l.length > 0)
  if (lines.length === 0) {
    console.error('Empty CSV')
    process.exit(1)
  }
  const headerFields = parseCsvLine(lines[0]).map(h => h.replace(/^\"|\"$/g, '').trim())
  const mapIndex = new Map()

  // Portuguese header order (when the CSV doesn't include headers we map by position)
  const PT_HEADER_ORDER = [
    'ID externo da ONU','Tipo de PON','SN','Tipo de ONU','Nome','OLT','Placa','Porta','ONU alocada','Zona','Endereço','Latitude','Longitude','ODB (Divisor)','Porta ODB','Modo','Modo WAN','Endereço IP','Máscara de sub-rede','Gateway padrão','DNS1','DNS2','Nome de usuário','Senha','CATV','Status administrativo','Data de autenticação','Status','Sinal','Sinal 1310','Sinal 1490','Distância (m)','Porta de serviço','VLAN da porta de serviço','CVLAN da porta de serviço','SVLAN da porta de serviço','Modo de transformação de tag da porta de serviço','Velocidade de upload da porta de serviço','Velocidade de download da porta de serviço','Contato','Perfil TR069','ID do dispositivo TR069'
  ]

  // Heuristic: if the first row looks like data (e.g., contains 'gpon' or a serial), treat file as headerless
  const firstRowLooksLikeData = headerFields.some(v => /gpon|xg|tplg|fd\d+/i.test(v)) || headerFields.length >= 10

  if (firstRowLooksLikeData) {
    // Build positional mapping from PT_HEADER_ORDER
    for (let i = 0; i < PT_HEADER_ORDER.length; i++) {
      const en = PT_TO_EN.get(PT_HEADER_ORDER[i]) || PT_HEADER_ORDER[i]
      mapIndex.set(en, i)
    }
  } else {
    // Build mapping from provided headers
    headerFields.forEach((h, idx) => {
      const norm = PT_TO_EN.get(h) || h
      mapIndex.set(norm, idx)
    })
  }

  // Build output header in target order
  const outHeader = TARGET_HEADERS.map(h => h)
  const outLines = [outHeader.join(',')]

  const startIndex = firstRowLooksLikeData ? 0 : 1
  for (let li = startIndex; li < lines.length; li++) {
    const row = parseCsvLine(lines[li])
    const outRow = new Array(TARGET_HEADERS.length).fill('')
    for (let ti = 0; ti < TARGET_HEADERS.length; ti++) {
      const col = TARGET_HEADERS[ti]
      const srcIdx = mapIndex.get(col)
      if (srcIdx != null && srcIdx < row.length) {
        outRow[ti] = row[srcIdx]
      } else {
        outRow[ti] = ''
      }
    }
    // Quote/escape fields and push
    outLines.push(outRow.map(quoteCsvField).join(','))
  }

  fs.writeFileSync(outPath, outLines.join('\n'), 'utf8')
  console.log('Wrote fixed CSV:', outPath)
}

main()
