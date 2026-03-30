import type {
  BaseOLTDriver,
  AuthorizeOnuDriverInput,
  AuthorizeOnuDriverResult,
} from '../../../drivers/olt/base-driver'
import { MockOLTDriver, DriverMode } from '../../../drivers/olt/base-driver'
import type {
  AuthorizeOnuNetworkCommandInput,
  AuthorizationProfileInput,
} from './types'

function resolveDriverForOlt(_oltId: string): BaseOLTDriver {
  return new MockOLTDriver({ mode: DriverMode.MOCK })
}

function extractProfiles(
  profiles: AuthorizationProfileInput[]
): AuthorizeOnuDriverResult | { line_profile?: string; service_profile?: string; vlans?: number[] } {
  let line_profile: string | undefined
  let service_profile: string | undefined
  const vlansSet = new Set<number>()

  for (const profile of profiles) {
    if (profile.line_profile) {
      if (line_profile && line_profile !== profile.line_profile) {
        return {
          status: 'rejected',
          message: 'Conflicting line_profile values provided',
        }
      }
      line_profile = profile.line_profile
    }

    if (profile.service_profile) {
      if (service_profile && service_profile !== profile.service_profile) {
        return {
          status: 'rejected',
          message: 'Conflicting service_profile values provided',
        }
      }
      service_profile = profile.service_profile
    }

    const vlanCandidates = [profile.service_vlan, profile.native_vlan]
    for (const vlan of vlanCandidates) {
      if (vlan === null || vlan === undefined) continue
      if (!Number.isInteger(vlan) || vlan < 1) {
        return {
          status: 'rejected',
          message: 'Invalid VLAN value provided',
        }
      }
      vlansSet.add(vlan)
    }
  }

  const vlans = vlansSet.size > 0 ? Array.from(vlansSet).sort((a, b) => a - b) : undefined

  return {
    line_profile,
    service_profile,
    vlans,
  }
}

export async function executeAuthorizeOnuNetworkCommand(
  input: AuthorizeOnuNetworkCommandInput
): Promise<AuthorizeOnuDriverResult> {
  if (
    !input.onu_serial ||
    !input.olt_id ||
    input.board_index === undefined ||
    input.pon_index === undefined
  ) {
    return {
      status: 'rejected',
      message: 'Missing required fields',
    }
  }

  const extracted = extractProfiles(input.authorization_profiles ?? [])
  if ('status' in extracted) {
    return extracted
  }

  const driverInput: AuthorizeOnuDriverInput = {
    serial: input.onu_serial,
    board: input.board_index,
    pon: input.pon_index,
    line_profile: extracted.line_profile,
    service_profile: extracted.service_profile,
    vlans: extracted.vlans,
  }

  const driver = resolveDriverForOlt(input.olt_id)

  try {
    return await driver.authorizeOnu(driverInput)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return {
      status: 'unknown_error',
      message,
    }
  }
}