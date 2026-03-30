export type DashboardOnuAuthPerDayInput = {
  days?: number
  olt_id?: number
}

export type DashboardOnuAuthPerDayItem = {
  date: string
  total_authorizations: number
}

export type DashboardOnuAuthPerDayOutput = {
  items: DashboardOnuAuthPerDayItem[]
}
