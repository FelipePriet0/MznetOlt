import type { ListConfiguredOnusInput, ListConfiguredOnusOutput } from './types'
import { listConfiguredOnusRepository } from './repository'

export async function listConfiguredOnusService(
  input: ListConfiguredOnusInput
): Promise<ListConfiguredOnusOutput> {
  const limit = input.limit && input.limit > 0 ? input.limit : 50
  const offset = input.offset && input.offset >= 0 ? input.offset : 0

  const items = await listConfiguredOnusRepository({
    olt_id: input.olt_id,
    last_known_status: input.last_known_status,
    onu_serial: input.onu_serial,
    limit,
    offset,
  })

  return {
    items,
  }
}