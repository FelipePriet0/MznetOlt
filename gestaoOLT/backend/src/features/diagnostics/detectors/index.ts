import type { Detector, DetectorType } from '../types'
import { reactiveDropDetector } from './reactive-drop'
import { flappingDetector } from './flapping'
import { rxTrendDetector } from './rx-trend'
import { ghostOnuDetector } from './ghost-onu'

export const detectorRegistry: Record<DetectorType, Detector> = {
  reactive_drop: reactiveDropDetector,
  flapping: flappingDetector,
  rx_trend: rxTrendDetector,
  ghost_onu: ghostOnuDetector,
  tx_dying: stub('tx_dying'),
}

function stub(name: DetectorType): Detector {
  return async () => {
    console.log(`[diagnostic-job] Detector "${name}" ainda não implementado, pulando.`)
    return []
  }
}
