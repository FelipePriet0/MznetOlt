import { listSpeedProfilesRepository } from './repository'
import type { ListSpeedProfilesInput, ListSpeedProfilesOutput } from './types'

export async function executeListSpeedProfiles(
  _input: ListSpeedProfilesInput
): Promise<ListSpeedProfilesOutput> {
  const items = await listSpeedProfilesRepository()
  return { items }
}

