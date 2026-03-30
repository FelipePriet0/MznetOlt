import type { DashboardNetworkStatusInput, DashboardNetworkStatusOutput, NetworkStatusGranularity } from './types'
import { fetchNetworkStatusRows } from './repository'

function bucketFor(date: Date, g: NetworkStatusGranularity): string {
  const d = new Date(date)
  if (g === 'hour') {
    d.setMinutes(0, 0, 0)
    return d.toISOString()
  }
  if (g === 'day') {
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  if (g === 'week') {
    const day = d.getDay() // 0-6
    const diff = (day + 6) % 7 // make Monday=0
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  if (g === 'month') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  // year
  d.setMonth(0, 1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function rangeStartFor(g: NetworkStatusGranularity): Date {
  const now = new Date()
  const d = new Date(now)
  if (g === 'hour') { d.setHours(d.getHours() - 24) }
  else if (g === 'day') { d.setDate(d.getDate() - 30) }
  else if (g === 'week') { d.setDate(d.getDate() - 7 * 12) } // ~3 months
  else if (g === 'month') { d.setMonth(d.getMonth() - 12) }
  else { d.setFullYear(d.getFullYear() - 5) }
  return d
}

export async function dashboardNetworkStatusService(input: DashboardNetworkStatusInput): Promise<DashboardNetworkStatusOutput> {
  const gran = input.granularity ?? 'day'
  const start = rangeStartFor(gran)
  const rows = await fetchNetworkStatusRows(start.toISOString(), input.olt_id)

  const map = new Map<string, { online_onus: number; power_fail: number; signal_loss: number; na: number; maximum: number }>()
  for (const r of rows) {
    const bucket = bucketFor(new Date(r.collected_at), gran)
    const prev = map.get(bucket) ?? { online_onus: 0, power_fail: 0, signal_loss: 0, na: 0, maximum: 0 }
    map.set(bucket, {
      online_onus: prev.online_onus + r.online_onus,
      power_fail: prev.power_fail + r.power_fail,
      signal_loss: prev.signal_loss + r.signal_loss,
      na: prev.na + r.na,
      maximum: Math.max(prev.maximum, r.maximum),
    })
  }

  const items = Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([ts, v]) => ({ collected_at: ts, ...v }))

  return { items }
}

