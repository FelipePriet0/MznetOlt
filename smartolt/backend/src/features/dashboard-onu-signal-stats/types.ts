export type DashboardOnuSignalStatsInput = {
  warning_threshold_dbm?: number
  critical_threshold_dbm?: number
}

export type DashboardOnuSignalStatsOutput = {
  sampled_onus: number
  weak_signal_onus: number
  critical_signal_onus: number
  warning_threshold_dbm: number
  critical_threshold_dbm: number
}

