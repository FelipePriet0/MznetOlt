export type DashboardSyncItem = {
  id: number
  job_name: string
  status: string
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  stats_json: unknown | null
}

export type DashboardSyncStatusOutput = {
  configured_sync: DashboardSyncItem | null
  unconfigured_sync: DashboardSyncItem | null
}
