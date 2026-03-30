import type { DriverConfiguredOnu, OperationStatus } from '@/drivers/olt/base-driver'

export type RunConfiguredOnusSyncInput = {
  olt_id: number
}

export type NetworkSyncRunStatus = OperationStatus | 'running'

export type NetworkSyncRunRow = {
  id: number
  olt_id: number
  job_name: string
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  status: NetworkSyncRunStatus
  error_message: string | null
  stats_json: unknown | null
  created_at: string
}

export type OnuNetworkSnapshotRow = {
  id: number
  olt_id: number
  onu_serial: string
  onu_id: number | null
  source: string
  last_known_status: string | null
  last_known_signal: number | null
  last_seen_at: string
  raw_snapshot: unknown | null
  created_at: string
  updated_at: string
}

export type NetworkEventRow = {
  id: number
  olt_id: number
  onu_id: number | null
  onu_serial: string
  event_type: string
  previous_state: unknown | null
  current_state: unknown | null
  payload: unknown | null
  created_at: string
}

export type RunConfiguredOnusSyncStats = {
  total_observed: number
  total_inserted: number
  total_updated: number
  total_events: number
  duration_ms: number
}

export type RunConfiguredOnusSyncOutput = {
  status: OperationStatus
  run_id: number | null
  stats: RunConfiguredOnusSyncStats
}

export type ObservedConfiguredOnu = DriverConfiguredOnu