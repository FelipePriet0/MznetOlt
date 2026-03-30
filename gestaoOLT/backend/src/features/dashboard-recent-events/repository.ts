import { supabase } from '@/shared/lib/supabase'
import type { DashboardRecentEventItem } from './types'

export async function listDashboardRecentEventsRepository(
  limit: number
): Promise<DashboardRecentEventItem[]> {
  const { data, error } = await supabase
    .from('onu_events')
    .select('id, event_type, olt_id, onu_serial, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []) as DashboardRecentEventItem[]
}