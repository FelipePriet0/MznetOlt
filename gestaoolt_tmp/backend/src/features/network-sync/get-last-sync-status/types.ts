export type GetLastSyncStatusInput = {
  olt_id: number
}

export type NetworkSyncRunRow = {
  id: number
  olt_id: number
  job_name: string
  status: string
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  error_message: string | null
  stats_json: unknown | null
}

export type LastSync = {
  run_id: number
  olt_id: number
  job_name: string
  status: string
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  error_message: string | null
  stats_json: unknown | null
}

export type GetLastSyncStatusOutput = {
  last_sync: LastSync | null
}

