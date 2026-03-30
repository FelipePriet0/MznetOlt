export type SearchOnuBySerialInput = {
  onu_serial: string
  olt_id?: number
}

export type OnuSnapshotItem = {
  olt_id: number
  onu_serial: string
  onu_id: number | null
  source: string
  last_known_status: string | null
  last_known_signal: number | null
  last_seen_at: string
  raw_snapshot: unknown
}

export type SearchOnuBySerialOutput = {
  item: OnuSnapshotItem | null
}

