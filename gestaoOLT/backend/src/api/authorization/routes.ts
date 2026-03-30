import type { RouteDefinition } from '../_shared/types'
import { listAuthorizationPresetsHandler } from './list-authorization-presets.handler'
import { getDefaultAuthorizationPresetHandler } from './get-default-authorization-preset.handler'
import { authorizeOnuHandler } from './authorize-onu.handler'

export const authorizationRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/api/authorization/presets', handler: listAuthorizationPresetsHandler },
  { method: 'GET', path: '/api/authorization/presets/default', handler: getDefaultAuthorizationPresetHandler },
  { method: 'POST', path: '/api/authorization/authorize', handler: authorizeOnuHandler },
]
