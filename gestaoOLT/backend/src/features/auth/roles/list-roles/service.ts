import { listRolesRepository } from './repository'
import type { ListRolesOutput } from './types'

export async function listRolesService(): Promise<ListRolesOutput> {
  return listRolesRepository()
}
