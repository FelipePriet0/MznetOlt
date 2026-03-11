import { supabase } from '@/shared/lib/supabase'
import type { TaskItem } from './types'

export async function listTasksRepository(): Promise<TaskItem[]> {
  const { data, error } = await supabase
    .from('network_sync_runs')
    .select('id, job_name, status, started_at, finished_at, duration_ms, stats_json')
    .order('started_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as TaskItem[]
}

