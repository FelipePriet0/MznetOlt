import type { RouteDefinition } from '../_shared/types'
import { listTicketsHandler } from './list-tickets.handler'

export const diagnosticsRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/tickets', handler: listTicketsHandler },
]
