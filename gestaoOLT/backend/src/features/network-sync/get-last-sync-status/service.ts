import type { GetLastSyncStatusInput, GetLastSyncStatusOutput, LastSync } from './types'
import { getLastSyncRunByOlt } from './repository'

export async function getLastSyncStatusService(
  input: GetLastSyncStatusInput
): Promise<GetLastSyncStatusOutput> {
  const row = await getLastSyncRunByOlt(input.olt_id)

  if (!row) return { last_sync: null }

  const last_sync: LastSync = {
    run_id: row.id,
    olt_id: row.olt_id,
    job_name: row.job_name,
    status: row.status,
    started_at: row.started_at,
    finished_at: row.finished_at,
    duration_ms: row.duration_ms,
    error_message: row.error_message,
    stats_json: row.stats_json,
  }

  return { last_sync }
}

