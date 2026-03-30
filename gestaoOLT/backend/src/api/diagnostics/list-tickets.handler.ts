import type { ApiRequest, ApiResponse } from '@/api/_shared/types'
import { ok } from '@/api/_shared/http'
import { mapErrorToResponse } from '@/api/_shared/errors'
import { listTicketsRepository } from '@/features/diagnostics/list-tickets/repository'

export async function listTicketsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const q = req.query

  const status = typeof q.status === 'string' ? q.status : undefined
  const urgency = typeof q.urgency === 'string' ? q.urgency : undefined
  const olt_id = q.olt_id ? Number(q.olt_id) : undefined
  const page = q.page ? Math.max(1, Number(q.page)) : 1
  const page_size = q.page_size ? Math.min(100, Math.max(1, Number(q.page_size))) : 50

  try {
    const { data, total } = await listTicketsRepository({ status, urgency, olt_id, page, page_size })
    ok(res, { items: data, total, page, page_size })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
