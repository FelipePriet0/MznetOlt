import type { RouteDefinition } from '../_shared/types'
import { healthHandler } from './health.handler'

export const healthRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/health', handler: healthHandler, protected: false },
]

