import { supabase } from '@/shared/lib/supabase'
import type { DashboardOnuAuthPerDayItem } from './types'

type OnuAuthorizationRow = {
  created_at: string
}

export async function fetchOnuAuthPerDayRepository(
  start_iso: string
): Promise<DashboardOnuAuthPerDayItem[]> {
  const { data, error } = await supabase
    .from('onu_authorizations')
    .select('created_at')
    .eq('status', 'success')
    .gte('created_at', start_iso)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  const map = new Map<string, number>()

  for (const row of (data ?? []) as OnuAuthorizationRow[]) {
    const day = row.created_at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + 1)
  }

  const items: DashboardOnuAuthPerDayItem[] = Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, total]) => ({ date, total_authorizations: total }))

  return items
}