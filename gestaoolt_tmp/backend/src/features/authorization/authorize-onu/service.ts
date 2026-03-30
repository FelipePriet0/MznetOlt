import { AuthorizeOnuInputSchema } from './schema'
import type {
  AuthorizeOnuInput,
  AuthorizeOnuOutput,
  AuthorizationPresetRow,
  AuthorizationPresetProfileRow,
  OnuRow,
} from './types'
import {
  findOnuById,
  findAuthorizationPresetById,
  findDefaultAuthorizationPreset,
  listAuthorizationPresetProfiles,
  insertAuthorizationEvent,
} from './repository'
import { executeAuthorizeOnuNetworkCommand } from '@/commands/network/authorize-onu-command/service'
import type { AuthorizationProfileInput } from '@/commands/network/authorize-onu-command/types'

export class OnuNotFoundForAuthorizationError extends Error {
  constructor() {
    super('ONU not found')
    this.name = 'OnuNotFoundForAuthorizationError'
  }
}

export class DefaultAuthorizationPresetNotFoundError extends Error {
  constructor() {
    super('Default authorization preset not found')
    this.name = 'DefaultAuthorizationPresetNotFoundError'
  }
}

function mapPresetProfilesToCommandProfiles(
  profiles: AuthorizationPresetProfileRow[]
): AuthorizationProfileInput[] {
  return profiles.map((profile) => ({
    line_profile:
      typeof profile.line_profile === 'string' ? profile.line_profile : null,
    service_profile:
      typeof profile.service_profile === 'string' ? profile.service_profile : null,
    service_vlan:
      typeof profile.service_vlan === 'number' ? profile.service_vlan : null,
    native_vlan:
      typeof profile.native_vlan === 'number' ? profile.native_vlan : null,
  }))
}

function buildAuthorizationCommandPayload(params: {
  onu: OnuRow
  preset: AuthorizationPresetRow
  profiles: AuthorizationPresetProfileRow[]
}) {
  return {
    type: 'AUTHORIZE_ONU' as const,
    payload: {
      onu_id: params.onu.id,
      onu_serial: params.onu.serial_number,
      olt_id: params.onu.olt_id,
      board_index: params.onu.board_id,
      pon_index: params.onu.pon_port_id,
      preset_id: params.preset.id,
      preset_name: params.preset.name,
      authorization_profiles: mapPresetProfilesToCommandProfiles(params.profiles),
    },
  }
}

export async function authorizeOnuService(
  input: AuthorizeOnuInput
): Promise<AuthorizeOnuOutput> {
  const parsed = AuthorizeOnuInputSchema.parse(input)

  const onu = await findOnuById(parsed.onu_id)
  if (!onu) throw new OnuNotFoundForAuthorizationError()

  let preset: AuthorizationPresetRow | null = null

  if (parsed.preset_id !== undefined) {
    preset = await findAuthorizationPresetById(parsed.preset_id)
  } else {
    preset = await findDefaultAuthorizationPreset()
  }

  if (!preset) throw new DefaultAuthorizationPresetNotFoundError()

  const profiles = await listAuthorizationPresetProfiles(preset.id)

  const command = buildAuthorizationCommandPayload({
    onu,
    preset,
    profiles,
  })

  const commandResult = await executeAuthorizeOnuNetworkCommand({
    onu_serial: command.payload.onu_serial,
    olt_id: String(command.payload.olt_id),
    board_index: command.payload.board_index,
    pon_index: command.payload.pon_index,
    authorization_profiles: command.payload.authorization_profiles,
  })

  const eventId = await insertAuthorizationEvent({
    onu_id: onu.id,
    preset_id: preset.id,
    payload: {
      command,
      command_result: commandResult,
    },
    status: commandResult.status,
  })

  return {
    success: commandResult.status === 'executed',
    event_id: eventId,
  }
}