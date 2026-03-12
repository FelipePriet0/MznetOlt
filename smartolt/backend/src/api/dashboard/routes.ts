import type { RouteDefinition } from '../_shared/types'
import { dashboardSummaryHandler } from './summary.handler'
import { dashboardSyncStatusHandler } from './sync-status.handler'
import { dashboardRecentEventsHandler } from './recent-events.handler'
import { dashboardOnuSignalStatsHandler } from './onu-signal-stats.handler'

export const dashboardRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/dashboard/summary', handler: dashboardSummaryHandler },
  { method: 'GET', path: '/api/dashboard/sync-status', handler: dashboardSyncStatusHandler },
  { method: 'GET', path: '/api/dashboard/recent-events', handler: dashboardRecentEventsHandler },
  { method: 'GET', path: '/api/dashboard/onu-signal-stats', handler: dashboardOnuSignalStatsHandler },
]
