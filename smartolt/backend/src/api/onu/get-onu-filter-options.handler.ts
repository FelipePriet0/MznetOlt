import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '../../shared/lib/supabase'

export async function getOnuFilterOptionsHandler(_req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('onus')
      .select('pon_type, mode, vlan_id, download_profile, upload_profile, profile, odb_splitter')

    if (error) throw error

    const rows = data ?? []
    const uniq = <T>(arr: (T | null | undefined)[]): T[] =>
      [...new Set(arr.filter((v): v is T => v !== null && v !== undefined))].sort() as T[]

    ok(res, {
      pon_types:         uniq(rows.map(r => r.pon_type)),
      modes:             uniq(rows.map(r => r.mode)),
      vlans:             (uniq(rows.map(r => r.vlan_id)) as number[]).sort((a, b) => a - b),
      download_profiles: uniq(rows.map(r => r.download_profile)),
      upload_profiles:   uniq(rows.map(r => r.upload_profile)),
      profiles:          uniq(rows.map(r => r.profile)),
      odb_splitters:     uniq(rows.map(r => r.odb_splitter)),
    })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
