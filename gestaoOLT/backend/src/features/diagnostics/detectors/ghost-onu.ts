import { supabase } from '@/shared/lib/supabase'
import type { JobOnu, DiagnosticRule, DetectorMatch } from '../types'

type TrafficRow = { onu_id: number; rx_bytes: number; tx_bytes: number }

export async function ghostOnuDetector(
  onus: JobOnu[],
  rule: DiagnosticRule
): Promise<DetectorMatch[]> {
  const config = rule.config as {
    window_hours?: number
    business_start_hour?: number
    business_end_hour?: number
    max_traffic_bytes?: number
  }
  const windowHours = config.window_hours ?? 8
  const businessStart = config.business_start_hour ?? 8
  const businessEnd = config.business_end_hour ?? 20
  const maxTrafficBytes = config.max_traffic_bytes ?? 1_048_576 // 1 MB

  // Só roda se o horário atual estiver dentro do período comercial
  const nowHour = new Date().getUTCHours()
  if (nowHour < businessStart || nowHour >= businessEnd) return []

  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()

  // ONUs online agora
  const onlineOnus = onus.filter((o) => o.status === 'online')
  if (onlineOnus.length === 0) return []

  const onlineIds = onlineOnus.map((o) => o.id)

  // Busca amostras de tráfego da janela em batch
  const { data, error } = await supabase
    .from('onu_traffic_samples')
    .select('onu_id, rx_bytes, tx_bytes')
    .in('onu_id', onlineIds)
    .gte('collected_at', since)

  if (error) throw error

  // Soma tráfego total por onu_id
  const trafficByOnu = new Map<number, number>()
  for (const row of (data ?? []) as TrafficRow[]) {
    const total = (row.rx_bytes ?? 0) + (row.tx_bytes ?? 0)
    trafficByOnu.set(row.onu_id, (trafficByOnu.get(row.onu_id) ?? 0) + total)
  }

  const onuMap = new Map<number, JobOnu>(onlineOnus.map((o) => [o.id, o]))

  const matches: DetectorMatch[] = []

  for (const onu of onlineOnus) {
    const totalBytes = trafficByOnu.get(onu.id) ?? 0

    // Se não tem nenhuma amostra no período, não há dados suficientes para concluir
    if (!trafficByOnu.has(onu.id)) continue

    if (totalBytes > maxTrafficBytes) continue

    matches.push({
      onu_id: onu.id,
      olt_id: onu.olt_id,
      urgency: 'low',
      title: `ONU fantasma — online sem tráfego em horário comercial (${onu.serial_number})`,
      facts: {
        serial_number: onu.serial_number,
        total_bytes: totalBytes,
        window_hours: windowHours,
        business_start_hour: businessStart,
        business_end_hour: businessEnd,
        max_traffic_bytes: maxTrafficBytes,
        since,
      },
    })
  }

  return matches
}
