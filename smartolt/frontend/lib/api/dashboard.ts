import { apiFetch } from './client'

export type DashboardSummary = {
  total_onus:        number
  online_onus:       number
  offline_onus:      number
  unconfigured_onus: number
  configured_onus:   number
}

export type DashboardSignalStats = {
  sampled_onus:          number
  weak_signal_onus:      number
  critical_signal_onus:  number
  warning_threshold_dbm: number
  critical_threshold_dbm: number
}

export type DashboardRecentEvent = {
  id:         number
  event_type: string
  olt_id:     number | null
  onu_serial: string | null
  created_at: string
}

export type DashboardRecentEvents = {
  items: DashboardRecentEvent[]
}

export type DashboardSyncItem = {
  id:          number
  job_name:    string
  status:      string
  started_at:  string
  finished_at: string | null
  duration_ms: number | null
}

export type DashboardSyncStatus = {
  configured_sync:   DashboardSyncItem | null
  unconfigured_sync: DashboardSyncItem | null
}


export const dashboardApi = {
  summary: () =>
    apiFetch<DashboardSummary>('/api/dashboard/summary'),

  signalStats: (params?: { warning_threshold_dbm?: number; critical_threshold_dbm?: number }) => {
    const q = new URLSearchParams()
    if (params?.warning_threshold_dbm)  q.set('warning_threshold_dbm',  String(params.warning_threshold_dbm))
    if (params?.critical_threshold_dbm) q.set('critical_threshold_dbm', String(params.critical_threshold_dbm))
    const qs = q.toString()
    return apiFetch<DashboardSignalStats>(`/api/dashboard/onu-signal-stats${qs ? `?${qs}` : ''}`)
  },

  recentEvents: (limit = 10) =>
    apiFetch<DashboardRecentEvents>(`/api/dashboard/recent-events?limit=${limit}`),

  syncStatus: () =>
    apiFetch<DashboardSyncStatus>('/api/dashboard/sync-status'),

  // graphs removed
}
