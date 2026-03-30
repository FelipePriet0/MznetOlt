import type {
  ListUnconfiguredOnusInput,
  ListUnconfiguredOnusOutput,
} from './types'
import { listUnconfiguredOnusRepository } from './repository'

export async function listUnconfiguredOnusService(
  input: ListUnconfiguredOnusInput
): Promise<ListUnconfiguredOnusOutput> {
  const limit = input.limit && input.limit > 0 ? input.limit : 50
  const offset = input.offset && input.offset >= 0 ? input.offset : 0

  const items = await listUnconfiguredOnusRepository({
    olt_id: input.olt_id,
    onu_serial: input.onu_serial,
    last_seen_at_from: input.last_seen_at_from,
    last_seen_at_to: input.last_seen_at_to,
    limit,
    offset,
  })

  return { items }
}