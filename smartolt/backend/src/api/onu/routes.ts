import type { RouteDefinition } from '../_shared/types'
import { listOnusHandler } from './list-onus.handler'
import { getOnuDetailsHandler } from './get-onu-details.handler'

export const onuRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/onu', handler: listOnusHandler },
  { method: 'GET', path: '/api/onu/:id', handler: getOnuDetailsHandler },
]
