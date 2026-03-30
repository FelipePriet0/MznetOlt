import { supabase } from '@/shared/lib/supabase'
import type { DashboardSummaryOutput } from './types'

export async function getDashboardSummary(): Promise<DashboardSummaryOutput> {
  const [total, online, offline, unconfigured, configured] = await Promise.all([
    supabase.from('onus').select('*', { count: 'exact', head: true }),
    supabase.from('onus').select('*', { count: 'exact', head: true }).eq('status', 'online'),
    supabase.from('onus').select('*', { count: 'exact', head: true }).eq('status', 'offline'),
    supabase.from('onus').select('*', { count: 'exact', head: true }).eq('status', 'unconfigured'),
    supabase.from('onus').select('*', { count: 'exact', head: true }).eq('status', 'configured'),
  ])

  if (total.error) throw total.error
  if (online.error) throw online.error
  if (offline.error) throw offline.error
  if (unconfigured.error) throw unconfigured.error
  if (configured.error) throw configured.error

  return {
    total_onus: total.count ?? 0,
    online_onus: online.count ?? 0,
    offline_onus: offline.count ?? 0,
    unconfigured_onus: unconfigured.count ?? 0,
    configured_onus: configured.count ?? 0,
  }
}
