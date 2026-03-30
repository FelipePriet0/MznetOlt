import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'

// Stub: reinício real requer integração CLI/telnet com a OLT
export async function restartPonPortOnusHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const portId = Number(req.params.portId)
  console.log(`[restart-pon-onus] portId=${portId} — stub, reinício real pendente`)
  ok(res, { restarted: true, portId })
}
