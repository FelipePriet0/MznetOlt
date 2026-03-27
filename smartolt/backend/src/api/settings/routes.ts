import type { RouteDefinition } from '../_shared/types'
import { env } from '@/config/env'
import { listZonesHandler } from './list-zones.handler'
import { listVlansHandler } from './list-vlans.handler'
import { createVlanHandler } from './create-vlan.handler'
import { deleteVlanHandler } from './delete-vlan.handler'
import { createZoneHandler } from './create-zone.handler'
import { deleteZoneHandler } from './delete-zone.handler'

const DEV = env.NODE_ENV === 'development'

export const settingsRoutes: RouteDefinition[] = [
  { method: 'GET',    path: '/api/settings/zones',      handler: listZonesHandler,   protected: DEV ? false : undefined },
  { method: 'POST',   path: '/api/settings/zones',      handler: createZoneHandler },
  { method: 'DELETE', path: '/api/settings/zones/:id',  handler: deleteZoneHandler },
  { method: 'GET',    path: '/api/settings/vlans',      handler: listVlansHandler,   protected: DEV ? false : undefined },
  { method: 'POST',   path: '/api/settings/vlans',      handler: createVlanHandler },
  { method: 'DELETE', path: '/api/settings/vlans/:id',  handler: deleteVlanHandler },
]
