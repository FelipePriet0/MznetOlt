import { supabase } from '@/shared/lib/supabase'
import type { DashboardSyncItem, DashboardSyncStatusOutput } from './types'

async function fetchLastByJob(job_name: string): Promise<DashboardSyncItem | null> {
  const { data, error } = await supabase
    .from('network_sync_runs')
    .select('id, job_name, status, started_at, finished_at, duration_ms, stats_json')
    .eq('job_name', job_name)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data as DashboardSyncItem | null) ?? null
}

export async function fetchDashboardSyncStatusRepository(): Promise<DashboardSyncStatusOutput> {
  const [configured_sync, unconfigured_sync] = await Promise.all([
    fetchLastByJob('configured_onus'),
    fetchLastByJob('unconfigured_onus'),
  ])

  return { configured_sync, unconfigured_sync }
}