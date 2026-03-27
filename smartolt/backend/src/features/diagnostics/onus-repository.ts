import { supabase } from '@/shared/lib/supabase'
import type { JobOnu } from './types'

export async function loadAllOnus(): Promise<JobOnu[]> {
  const { data, error } = await supabase
    .from('onus')
    .select('id, olt_id, pon_port_id, serial_number, status, last_seen_at, last_known_signal')

  if (error) throw error
  return (data ?? []) as JobOnu[]
}
