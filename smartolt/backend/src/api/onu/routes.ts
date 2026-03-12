import type { RouteDefinition } from '../_shared/types'
import { listOnusHandler } from './list-onus.handler'
import { getOnuDetailsHandler } from './get-onu-details.handler'
import { getOnuStatusHandler } from './get-onu-status.handler'
import { getOnuSignalHistoryHandler } from './get-onu-signal-history.handler'
import { getOnuTrafficHistoryHandler } from './get-onu-traffic-history.handler'
import { resyncOnuHandler } from './resync.handler'
import { disableOnuHandler } from './disable.handler'

export const onuRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/onu', handler: listOnusHandler },
  { method: 'GET', path: '/api/onu/:id', handler: getOnuDetailsHandler },
  { method: 'GET', path: '/api/onu/:id/status', handler: getOnuStatusHandler },
  { method: 'GET', path: '/api/onu/:id/signal', handler: getOnuSignalHistoryHandler },
  { method: 'GET', path: '/api/onu/:id/traffic', handler: getOnuTrafficHistoryHandler },
  { method: 'POST', path: '/api/onu/resync', handler: resyncOnuHandler },
  { method: 'POST', path: '/api/onu/disable', handler: disableOnuHandler },
]
