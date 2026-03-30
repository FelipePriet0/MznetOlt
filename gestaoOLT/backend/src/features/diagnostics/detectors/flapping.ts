import { supabase } from '@/shared/lib/supabase'
import type { JobOnu, DiagnosticRule, DetectorMatch } from '../types'

export async function flappingDetector(
  onus: JobOnu[],
  rule: DiagnosticRule
): Promise<DetectorMatch[]> {
  const config = rule.config as { window_hours?: number; min_events?: number }
  const windowHours = config.window_hours ?? 4
  const minEvents = config.min_events ?? 5

  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()

  // Busca todos os eventos onu_offline dentro da janela, em batch
  const { data, error } = await supabase
    .from('onu_events')
    .select('onu_id, created_at')
    .eq('event_type', 'onu_offline')
    .gte('created_at', since)

  if (error) throw error

  // Conta quedas por onu_id
  const dropCount = new Map<number, number>()
  for (const row of data ?? []) {
    const id = (row as { onu_id: number }).onu_id
    dropCount.set(id, (dropCount.get(id) ?? 0) + 1)
  }

  // Mapeia onu_id → ONU para lookup rápido
  const onuMap = new Map<number, JobOnu>(onus.map((o) => [o.id, o]))

  const matches: DetectorMatch[] = []

  for (const [onu_id, count] of dropCount) {
    if (count < minEvents) continue

    const onu = onuMap.get(onu_id)
    if (!onu) continue // ONU não está no conjunto ativo, ignora

    matches.push({
      onu_id: onu.id,
      olt_id: onu.olt_id,
      urgency: 'high',
      title: `ONU com flapping — ${count} quedas em ${windowHours}h (${onu.serial_number})`,
      facts: {
        serial_number: onu.serial_number,
        drop_count: count,
        window_hours: windowHours,
        min_events: minEvents,
        since,
      },
    })
  }

  return matches
}
