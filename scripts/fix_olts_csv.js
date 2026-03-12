#!/usr/bin/env node
// Normalize SmartOLT OLT export to staging table import_olts_staging
// Usage: node scripts/fix_olts_csv.js <input.csv> [output.csv]

const fs = require('fs')
const path = require('path')

const TARGET_HEADERS = ['name','vendor','mgmt_ip','location_name','zone_name']

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function quoteCsvField(v){
  if (v == null) v = ''
  const s = String(v)
  return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s
}

function main(){
  const input = process.argv[2]
  if (!input){
    console.error('Usage: node scripts/fix_olts_csv.js <input.csv> [output.csv]')
    process.exit(1)
  }
  const outPath = process.argv[3] || path.join(path.dirname(input), path.basename(input, path.extname(input)) + '_fixed.csv')
  const raw = fs.readFileSync(input,'utf8')
  const lines = raw.split(/\r?\n/).filter(l => l.length>0)
  if (!lines.length){ console.error('Empty CSV'); process.exit(1) }
  const header = parseCsvLine(lines[0])

  // Build column indices
  const col = new Map()
  header.forEach((h,i)=> col.set(h.replace(/^\"|\"$/g,'').trim(), i))

  // possible header labels for name and ip
  const NAME_KEYS = ['OLT name','Nome da OLT']
  const IP_KEYS   = ['OLT IP/FQDN','IP/FQDN da OLT']

  const nameIdx = NAME_KEYS.map(k=>col.get(k)).find(i => i!=null)
  const ipIdx   = IP_KEYS.map(k=>col.get(k)).find(i => i!=null)

  if (nameIdx == null || ipIdx == null){
    console.error('Could not find required columns (OLT name, OLT IP/FQDN) in header')
    process.exit(1)
  }

  const out = [TARGET_HEADERS.join(',')]

  for (let li=1; li<lines.length; li++){
    const row = parseCsvLine(lines[li])
    // Ignore board lines (often start with '-') or rows without a name
    const name = (row[nameIdx] || '').replace(/^\"|\"$/g,'').trim()
    const mgmt = (row[ipIdx] || '').replace(/^\"|\"$/g,'').trim()
    if (!name) continue
    if (row[0] && row[0].trim().startsWith('-')) continue

    const rec = {
      name,
      vendor: 'Unknown',
      mgmt_ip: mgmt,
      location_name: 'Default',
      zone_name: 'Default'
    }
    out.push(TARGET_HEADERS.map(k => quoteCsvField(rec[k])).join(','))
  }

  fs.writeFileSync(outPath, out.join('\n'), 'utf8')
  console.log('Wrote fixed OLT CSV:', outPath)
}

main()

