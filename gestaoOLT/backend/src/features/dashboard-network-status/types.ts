export type NetworkStatusGranularity = 'hour' | 'day' | 'week' | 'month' | 'year'

export type DashboardNetworkStatusInput = {
  granularity?: NetworkStatusGranularity
  olt_id?: number
}

export type DashboardNetworkStatusItem = {
  collected_at: string
  online_onus: number
  power_fail: number
  signal_loss: number
  na: number
  maximum: number
}

export type DashboardNetworkStatusOutput = {
  items: DashboardNetworkStatusItem[]
}

