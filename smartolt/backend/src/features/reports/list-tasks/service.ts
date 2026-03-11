import { listTasksRepository } from './repository'
import type { ListTasksInput, ListTasksOutput } from './types'

export async function executeListTasks(
  _input: ListTasksInput
): Promise<ListTasksOutput> {
  const items = await listTasksRepository()
  return { items }
}

