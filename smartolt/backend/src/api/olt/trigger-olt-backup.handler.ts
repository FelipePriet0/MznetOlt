import type { ApiRequest, ApiResponse } from '../_shared/types'
import { created, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function triggerOltBackupHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  // Calculate next backup (+24h by default)
  const next = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  try {
    const { data, error } = await supabase
      .from('olt_backups')
      .insert({ olt_id: id, status: 'success', next_backup_at: next, backup_type: 'manual' })
      .select('id, status, size_kb, next_backup_at, notes, backup_type, line_count, created_at')
      .single()

    if (error) throw error
    created(res, data)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
