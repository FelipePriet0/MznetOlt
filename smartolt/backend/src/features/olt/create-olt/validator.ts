import { supabase } from '@/shared/lib/supabase'
import type { CreateOltInput } from './types'

export class DuplicateMgmtIpError extends Error {
  constructor() {
    super('An OLT with this management IP already exists')
    this.name = 'DuplicateMgmtIpError'
  }
}

export class LocationNotFoundError extends Error {
  constructor() {
    super('Location not found')
    this.name = 'LocationNotFoundError'
  }
}

export class ZoneNotFoundError extends Error {
  constructor() {
    super('Zone not found')
    this.name = 'ZoneNotFoundError'
  }
}

export async function validateCreateOlt(input: CreateOltInput): Promise<void> {
  const { data: existing } = await supabase
    .from('olts')
    .select('id')
    .eq('mgmt_ip', input.mgmt_ip)
    .maybeSingle()

  if (existing) throw new DuplicateMgmtIpError()

  const { data: location } = await supabase
    .from('locations')
    .select('id')
    .eq('id', input.location_id)
    .maybeSingle()

  if (!location) throw new LocationNotFoundError()

  const { data: zone } = await supabase
    .from('zones')
    .select('id')
    .eq('id', input.zone_id)
    .maybeSingle()

  if (!zone) throw new ZoneNotFoundError()
}
