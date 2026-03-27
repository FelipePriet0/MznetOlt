import { env } from './config/env'
import { createApiServer } from './api/server'
import { startDiagnosticJobScheduler } from './features/diagnostics/job'

const server = createApiServer()

server.listen(env.PORT, () => {
  console.log(`[SmartOLT] Server running on http://localhost:${env.PORT}`)
  console.log(`[SmartOLT] Environment: ${env.NODE_ENV}`)
  startDiagnosticJobScheduler()
})
