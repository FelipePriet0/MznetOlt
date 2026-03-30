import { supabase } from '@/shared/lib/supabase'
import type { AuthorizationPresetProfileRow, AuthorizationPresetRow, OnuRow } from './types'
import type { AuthorizeOnuDriverResult, OperationStatus } from '@/drivers/olt/base-driver'

export async function findOnuById(onu_id: number): Promise<OnuRow | null> {
  const { data, error } = await supabase
    .from('onus')
    .select('id, serial_number, olt_id, board_id, pon_port_id')
    .eq('id', onu_id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as OnuRow
}

export async function findAuthorizationPresetById(
  preset_id: number
): Promise<AuthorizationPresetRow | null> {
  const { data, error } = await supabase
    .from('authorization_presets')
    .select('id, name, description, is_default, is_active, created_at, updated_at')
    .eq('id', preset_id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AuthorizationPresetRow
}

export async function findDefaultAuthorizationPreset(): Promise<AuthorizationPresetRow | null> {
  const { data, error } = await supabase
    .from('authorization_presets')
    .select('id, name, description, is_default, is_active, created_at, updated_at')
    .eq('is_default', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AuthorizationPresetRow
}

export async function listAuthorizationPresetProfiles(
  preset_id: number
): Promise<AuthorizationPresetProfileRow[]> {
  const { data, error } = await supabase
    .from('authorization_preset_profiles')
    .select('*')
    .eq('authorization_preset_id', preset_id)

  if (error) throw error

  return (data ?? []) as AuthorizationPresetProfileRow[]
}

type AuthorizationEventPayload = {
  command: unknown
  command_result: AuthorizeOnuDriverResult
}

export async function insertAuthorizationEvent(event: {
  onu_id: number
  preset_id: number
  payload: AuthorizationEventPayload
  status: OperationStatus
}): Promise<number | null> {
  const { data, error } = await supabase
    .from('authorization_events')
    .insert({
      onu_id: event.onu_id,
      preset_id: event.preset_id,
      payload: event.payload,
      status: event.status,
    })
    .select('id')
    .single()

  if (error) {
    return null
  }

  return (data as { id: number }).id ?? null
}
