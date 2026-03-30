import { supabase } from '@/shared/lib/supabase'
import type { JobOnu, DiagnosticRule, DetectorMatch, Urgency } from '../types'

type SignalRow = { onu_id: number; rx_dbm: number; ts: string }

// Regressão linear mínimos quadrados — retorna inclinação em unidades por hora
function slopePerHour(samples: SignalRow[]): number {
  const n = samples.length
  if (n < 2) return 0

  const t0 = new Date(samples[0].ts).getTime()
  const points = samples.map((s) => ({
    x: (new Date(s.ts).getTime() - t0) / (1000 * 60 * 60), // horas desde o primeiro ponto
    y: s.rx_dbm,
  }))

  const sumX = points.reduce((a, p) => a + p.x, 0)
  const sumY = points.reduce((a, p) => a + p.y, 0)
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0)
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0)

  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return 0

  return (n * sumXY - sumX * sumY) / denom
}

function classifyUrgency(slope: number, rxLast: number): Urgency {
  if (slope < -0.5 || rxLast < -28) return 'critical'
  if (slope < -0.25 || rxLast < -26) return 'high'
  if (slope < -0.15) return 'medium'
  return 'low'
}

export async function rxTrendDetector(
  onus: JobOnu[],
  rule: DiagnosticRule
): Promise<DetectorMatch[]> {
  const config = rule.config as {
    window_hours?: number
    min_samples?: number
    slope_threshold_dbm_per_hour?: number
  }
  const windowHours = config.window_hours ?? 24
  const minSamples = config.min_samples ?? 6
  const slopeThreshold = config.slope_threshold_dbm_per_hour ?? -0.1

  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()

  // Batch: uma query para todas as amostras da janela
  const { data, error } = await supabase
    .from('onu_signal_history')
    .select('onu_id, rx_dbm, ts')
    .gte('ts', since)
    .order('ts', { ascending: true })

  if (error) throw error

  // Agrupa amostras por onu_id
  const byOnu = new Map<number, SignalRow[]>()
  for (const row of (data ?? []) as SignalRow[]) {
    if (!byOnu.has(row.onu_id)) byOnu.set(row.onu_id, [])
    byOnu.get(row.onu_id)!.push(row)
  }

  const onuMap = new Map<number, JobOnu>(onus.map((o) => [o.id, o]))

  const matches: DetectorMatch[] = []

  for (const [onu_id, samples] of byOnu) {
    if (samples.length < minSamples) continue

    const onu = onuMap.get(onu_id)
    if (!onu) continue

    const slope = slopePerHour(samples)

    // Só sinaliza se a inclinação for pior que o threshold (mais negativa)
    if (slope >= slopeThreshold) continue

    const rxFirst = samples[0].rx_dbm
    const rxLast = samples[samples.length - 1].rx_dbm
    const rxMin = Math.min(...samples.map((s) => s.rx_dbm))
    const rxMax = Math.max(...samples.map((s) => s.rx_dbm))

    matches.push({
      onu_id: onu.id,
      olt_id: onu.olt_id,
      urgency: classifyUrgency(slope, rxLast),
      title: `Tendência de queda de RX — ${slope.toFixed(3)} dBm/h (${onu.serial_number})`,
      facts: {
        serial_number: onu.serial_number,
        slope_dbm_per_hour: parseFloat(slope.toFixed(4)),
        sample_count: samples.length,
        window_hours: windowHours,
        rx_first_dbm: rxFirst,
        rx_last_dbm: rxLast,
        rx_min_dbm: rxMin,
        rx_max_dbm: rxMax,
        since,
      },
    })
  }

  return matches
}
