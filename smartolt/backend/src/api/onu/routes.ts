import type { RouteDefinition } from '../_shared/types'
import { env } from '@/config/env'
import { listOnusHandler } from './list-onus.handler'
import { listUnconfiguredOnusHandler } from './list-unconfigured.handler'
import { getOnuDetailsHandler } from './get-onu-details.handler'
import { getOnuStatusHandler } from './get-onu-status.handler'
import { resyncOnuHandler } from './resync.handler'
import { disableOnuHandler } from './disable.handler'
import { updateOnuHandler } from './update-onu.handler'
import { getOnuRunningConfigHandler } from './get-running-config.handler'
import { getOnuSoftwareInfoHandler } from './get-software-info.handler'
import { getSignalHistoryHandler } from './get-signal-history.handler'
import { listEthernetPortsHandler } from './list-ethernet-ports.handler'
import { updateEthernetPortHandler } from './update-ethernet-port.handler'
import { getOnuEventsHandler } from './get-onu-events.handler'
import { getOnuTrafficHandler } from './get-onu-traffic.handler'

const DEV = env.NODE_ENV === 'development'

export const onuRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/onu', handler: listOnusHandler },
  { method: 'GET', path: '/api/onu/unconfigured', handler: listUnconfiguredOnusHandler },
  // Leitura pública apenas em DEV para facilitar smoke/local
  { method: 'GET', path: '/api/onu/:id', handler: getOnuDetailsHandler, protected: DEV ? false : undefined },
  { method: 'GET', path: '/api/onu/:id/status', handler: getOnuStatusHandler },
  { method: 'POST', path: '/api/onu/resync', handler: resyncOnuHandler },
  { method: 'POST', path: '/api/onu/disable', handler: disableOnuHandler },
  { method: 'PATCH', path: '/api/onu/:id', handler: updateOnuHandler },
  { method: 'GET', path: '/api/onu/:id/running-config', handler: getOnuRunningConfigHandler },
  { method: 'GET', path: '/api/onu/:id/software-info', handler: getOnuSoftwareInfoHandler },
  { method: 'GET', path: '/api/onu/:id/signal-history', handler: getSignalHistoryHandler },
  { method: 'GET', path: '/api/onu/:id/ethernet-ports', handler: listEthernetPortsHandler },
  { method: 'GET', path: '/api/onu/:id/events', handler: getOnuEventsHandler },
  { method: 'GET', path: '/api/onu/:id/traffic', handler: getOnuTrafficHandler },
  { method: 'PATCH', path: '/api/onu/:id/ethernet-ports/:portId', handler: updateEthernetPortHandler },
]
