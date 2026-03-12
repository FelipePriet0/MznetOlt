import type { RouteDefinition } from '../_shared/types'
import { listZonesHandler } from './list-zones.handler'
import { listOnuTypesHandler } from './list-onu-types.handler'
import { listSpeedProfilesHandler } from './list-speed-profiles.handler'

export const settingsRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/settings/zones', handler: listZonesHandler },
  { method: 'GET', path: '/api/settings/onu-types', handler: listOnuTypesHandler },
  { method: 'GET', path: '/api/settings/speed-profiles', handler: listSpeedProfilesHandler },
]
