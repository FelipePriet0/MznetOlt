import { getPonTrafficSeries } from './repository'
import type { TrafficPonSeriesInput, TrafficPonSeriesOutput } from './types'

export class MissingRequiredFieldsError extends Error {
  constructor() {
    super('start_at and end_at are required')
    this.name = 'MissingRequiredFieldsError'
  }
}

export async function executeGetPonTrafficSeries(
  input: TrafficPonSeriesInput
): Promise<TrafficPonSeriesOutput> {
  if (!input.start_at || !input.end_at) {
    throw new MissingRequiredFieldsError()
  }

  return getPonTrafficSeries(input)
}

