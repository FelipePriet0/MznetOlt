import type { RouteDefinition } from '../_shared/types'
import { loginHandler } from './login.handler'
import { meHandler } from './me.handler'

export const authRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/auth/login', handler: loginHandler, protected: false },
  { method: 'GET', path: '/api/auth/me', handler: meHandler },
]
