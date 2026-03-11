import { findOltById } from './repository'
import { GetOltDetailsInputSchema } from './schema'
import type { GetOltDetailsInput, GetOltDetailsOutput } from './types'

export class OltNotFoundError extends Error {
  constructor() {
    super('OLT not found')
    this.name = 'OltNotFoundError'
  }
}

export async function getOltDetailsService(input: GetOltDetailsInput): Promise<GetOltDetailsOutput> {
  const parsed = GetOltDetailsInputSchema.parse(input)

  const olt = await findOltById(parsed.id)

  if (!olt) throw new OltNotFoundError()

  return {
    id: olt.id,
    name: olt.name,
    vendor: olt.vendor,
    mgmt_ip: olt.mgmt_ip,
    location_id: olt.location_id,
    location_name: olt.locations?.name ?? null,
    zone_id: olt.zone_id,
    zone_name: olt.zones?.name ?? null,
    created_at: olt.created_at,
    updated_at: olt.updated_at,
  }
}
