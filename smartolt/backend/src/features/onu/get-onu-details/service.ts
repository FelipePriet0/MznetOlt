import { findOnuById } from './repository'
import { GetOnuDetailsInputSchema } from './schema'
import type { GetOnuDetailsInput, GetOnuDetailsOutput } from './types'

export class OnuNotFoundError extends Error {
  constructor() {
    super('ONU not found')
    this.name = 'OnuNotFoundError'
  }
}

export async function getOnuDetailsService(input: GetOnuDetailsInput): Promise<GetOnuDetailsOutput> {
  const parsed = GetOnuDetailsInputSchema.parse(input)

  const onu = await findOnuById(parsed.id)

  if (!onu) throw new OnuNotFoundError()

  return {
    id: onu.id,
    serial_number: onu.serial_number,
    status: onu.status,
    admin_state: onu.admin_state,
    last_known_signal: onu.last_known_signal,
    last_seen_at: onu.last_seen_at,
    olt_id: onu.olt_id,
    olt_name: onu.olts.name,
    board_id: onu.board_id,
    board_name: onu.boards.name,
    board_slot_index: onu.boards.slot_index,
    pon_port_id: onu.pon_port_id,
    pon_port_name: onu.pon_ports.name,
    pon_index: onu.pon_ports.pon_index,
    onu_type_id: onu.onu_type_id,
    onu_vendor: onu.onu_types?.vendor ?? null,
    onu_model: onu.onu_types?.model ?? null,
    created_at: onu.created_at,
    updated_at: onu.updated_at,
  }
}
