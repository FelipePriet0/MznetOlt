import { listZonesRepository } from './repository'
import type { ListZonesInput, ListZonesOutput } from './types'

export async function executeListZones(
  _input: ListZonesInput
): Promise<ListZonesOutput> {
  const items = await listZonesRepository()
  return { items }
}
