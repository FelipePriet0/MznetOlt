export type DashboardRecentEventsInput = {
  limit?: number
}

export type DashboardRecentEventItem = {
  id: number
  event_type: string
  olt_id: number | null
  onu_serial: string | null
  created_at: string
}

export type DashboardRecentEventsOutput = {
  items: DashboardRecentEventItem[]
}

