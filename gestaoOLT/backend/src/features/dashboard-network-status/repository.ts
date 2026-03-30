import { supabase } from '@/shared/lib/supabase'

type Row = {
  olt_id: number | null
  online_onus: number
  power_fail: number
  signal_loss: number
  na: number
  maximum: number
  collected_at: string
}

export async function fetchNetworkStatusRows(startIso: string, olt_id?: number): Promise<Row[]> {
  let query = supabase
    .from('network_status_samples')
    .select('olt_id, online_onus, power_fail, signal_loss, na, maximum, collected_at')
    .gte('collected_at', startIso)
    .order('collected_at', { ascending: true })

  if (olt_id !== undefined) query = query.eq('olt_id', olt_id)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Row[]
}

