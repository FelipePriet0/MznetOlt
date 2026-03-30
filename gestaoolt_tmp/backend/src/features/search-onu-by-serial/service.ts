import type { SearchOnuBySerialInput, SearchOnuBySerialOutput } from './types'
import { searchOnuBySerialRepository } from './repository'

export async function searchOnuBySerialService(
  input: SearchOnuBySerialInput
): Promise<SearchOnuBySerialOutput> {
  const item = await searchOnuBySerialRepository(input)

  return { item }
}