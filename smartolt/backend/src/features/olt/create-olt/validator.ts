import type { CreateOltInput } from './types'
import { existsLocationById, existsOltByMgmtIp, existsZoneById } from './repository'

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
  const duplicate = await existsOltByMgmtIp(input.mgmt_ip)
  if (duplicate) throw new DuplicateMgmtIpError()

  const hasLocation = await existsLocationById(input.location_id)
  if (!hasLocation) throw new LocationNotFoundError()

  const hasZone = await existsZoneById(input.zone_id)
  if (!hasZone) throw new ZoneNotFoundError()
}
