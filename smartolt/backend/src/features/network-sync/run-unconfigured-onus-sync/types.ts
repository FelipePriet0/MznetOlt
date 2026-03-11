import type { DriverUnconfiguredOnu, OperationStatus } from '@/drivers/olt/base-driver'

export type RunUnconfiguredOnusSyncInput = {
  olt_id: number
}

export type RunUnconfiguredOnusSyncStats = {
  total_observed: number
  total_inserted: number
  total_updated: number
  total_events: number
  duration_ms: number
}

export type RunUnconfiguredOnusSyncOutput = {
  status: OperationStatus
  run_id: number | null
  stats: RunUnconfiguredOnusSyncStats
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

export type ObservedUnconfiguredOnu = DriverUnconfiguredOnu