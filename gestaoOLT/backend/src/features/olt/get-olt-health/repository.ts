import { supabase } from '@/shared/lib/supabase'
import type { GetOltHealthInput, GetOltHealthOutput, OltHealthItem } from './types'

type OltHealthRow = {
  cpu_usage: number
  memory_usage: number
  temperature: number
  fan_status: string
  collected_at: string
}

export async function getOltHealth(
  input: GetOltHealthInput
): Promise<GetOltHealthOutput> {
  const { data, error } = await supabase
    .from('olt_health_samples')
    .select('cpu_usage, memory_usage, temperature, fan_status, collected_at')
    .eq('olt_id', input.olt_id)
    .order('collected_at', { ascending: false })
    .limit(1)

  if (error) {
    throw error
  }

  const row = ((data ?? []) as OltHealthRow[])[0]

  if (!row) {
    return { item: null }
  }

  const item: OltHealthItem = {
    cpu_usage: row.cpu_usage,
    memory_usage: row.memory_usage,
    temperature: row.temperature,
    fan_status: row.fan_status,
    collected_at: row.collected_at,
  }

  return { item }
}

