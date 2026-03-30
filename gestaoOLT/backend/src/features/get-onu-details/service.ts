import type { GetOnuDetailsInput, GetOnuDetailsOutput } from './types'
import { fetchInternalOnuById, fetchLatestOnuSnapshot } from './repository'

export async function getOnuDetailsService(
  input: GetOnuDetailsInput
): Promise<GetOnuDetailsOutput> {
  const snapshot = await fetchLatestOnuSnapshot(input)

  if (!snapshot) {
    return { item: null }
  }

  let internal_onu = null

  if (snapshot.onu_id !== null) {
    internal_onu = await fetchInternalOnuById(snapshot.onu_id)
  }

  return {
    item: {
      snapshot,
      internal_onu,
    },
  }
}