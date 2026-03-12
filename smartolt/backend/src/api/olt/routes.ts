import type { RouteDefinition } from '../_shared/types'
import { listOltsHandler } from './list-olts.handler'
import { createOltHandler } from './create-olt.handler'
import { getOltDetailsHandler } from './get-olt-details.handler'
import { getOltHealthHandler } from './get-olt-health.handler'

export const oltRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/olt', handler: listOltsHandler },
  { method: 'POST', path: '/api/olt', handler: createOltHandler },
  { method: 'GET', path: '/api/olt/:id', handler: getOltDetailsHandler },
  { method: 'GET', path: '/api/olt/:id/health', handler: getOltHealthHandler },
]
