import { supabase } from '@/shared/lib/supabase'
import type { DashboardOnuAuthPerDayItem } from './types'

type OnuAuthorizationRow = {
  created_at: string
}

export async function fetchOnuAuthPerDayRepository(
  start_iso: string,
  olt_id?: number
): Promise<DashboardOnuAuthPerDayItem[]> {
  // When filtering by OLT, avoid relying on implicit FK joins (may be missing in some envs)
  let onuFilterIds: number[] | undefined
  if (olt_id !== undefined) {
    const { data: onuRows, error: onuErr } = await supabase
      .from('onus')
      .select('id')
      .eq('olt_id', olt_id)
    if (onuErr) throw onuErr
    onuFilterIds = (onuRows ?? []).map((r: any) => r.id)
    if (!onuFilterIds.length) return []
  }

  let query = supabase
    .from('onu_authorizations')
    .select('created_at')
    .eq('status', 'success')
    .gte('created_at', start_iso)
    .order('created_at', { ascending: true })

  if (onuFilterIds) {
    query = query.in('onu_id', onuFilterIds as any)
  }

  const { data, error } = await query

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
