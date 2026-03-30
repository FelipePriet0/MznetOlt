import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest, notFound } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function deleteOltBackupHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const oltId    = Number(req.params.id)
  const backupId = Number(req.params.backupId)
  if (!oltId || isNaN(oltId) || !backupId || isNaN(backupId))
    return badRequest(res, 'id and backupId must be valid numbers')

  try {
    const { data, error } = await supabase
      .from('olt_backups')
      .delete()
      .eq('id', backupId)
      .eq('olt_id', oltId)
      .select('id')
      .single()

    if (error) throw error
    if (!data) return notFound(res, 'Backup não encontrado')
    ok(res, { deleted: true })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
