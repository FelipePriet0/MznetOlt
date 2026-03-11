import { getUplinkOctetsSeries } from './repository'
import type {
  UplinkOctetsSeriesInput,
  UplinkOctetsSeriesOutput,
} from './types'

export async function executeGetUplinkOctetsSeries(
  input: UplinkOctetsSeriesInput
): Promise<UplinkOctetsSeriesOutput> {
  return getUplinkOctetsSeries(input)
}

