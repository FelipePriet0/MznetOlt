import { getUplinkErrorsSeries } from './repository'
import type {
  UplinkErrorsSeriesInput,
  UplinkErrorsSeriesOutput,
} from './types'

export async function executeGetUplinkErrorsSeries(
  input: UplinkErrorsSeriesInput
): Promise<UplinkErrorsSeriesOutput> {
  return getUplinkErrorsSeries(input)
}

