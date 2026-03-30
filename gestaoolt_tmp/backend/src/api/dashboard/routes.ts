import type { RouteDefinition } from '../_shared/types'
import { dashboardSummaryHandler } from './summary.handler'
import { dashboardSyncStatusHandler } from './sync-status.handler'
import { dashboardRecentEventsHandler } from './recent-events.handler'
import { dashboardOnuSignalStatsHandler } from './onu-signal-stats.handler'
import { dashboardNetworkStatusHandler } from './network-status.handler'
import { dashboardOnuAuthPerDayHandler } from './onu-auth-per-day.handler'
// graphs removed

export const dashboardRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/dashboard/summary', handler: dashboardSummaryHandler },
  { method: 'GET', path: '/api/dashboard/sync-status', handler: dashboardSyncStatusHandler },
  { method: 'GET', path: '/api/dashboard/recent-events', handler: dashboardRecentEventsHandler },
  { method: 'GET', path: '/api/dashboard/onu-signal-stats', handler: dashboardOnuSignalStatsHandler },
  { method: 'GET', path: '/api/dashboard/onu-auth-per-day', handler: dashboardOnuAuthPerDayHandler },
  { method: 'GET', path: '/api/dashboard/network-status', handler: dashboardNetworkStatusHandler },
]
