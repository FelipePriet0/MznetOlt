import { getOltHealth } from './repository'
import type { GetOltHealthInput, GetOltHealthOutput } from './types'

export async function executeGetOltHealth(
  input: GetOltHealthInput
): Promise<GetOltHealthOutput> {
  return getOltHealth(input)
}

