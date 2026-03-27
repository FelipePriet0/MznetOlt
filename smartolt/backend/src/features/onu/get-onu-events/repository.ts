import { supabase } from '@/shared/lib/supabase'
import type { OnuEventItem } from './types'

export async function getOnuEventsRepository(onu_id: number, limit = 5): Promise<OnuEventItem[]> {
  const { data, error } = await supabase
    .from('network_events')
    .select('id, event_type, created_at')
    .eq('onu_id', onu_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as OnuEventItem[]
}
