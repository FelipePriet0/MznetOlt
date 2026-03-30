import type { OperationStatus, DriverUnconfiguredOnu } from '../../../drivers/olt/base-driver'

export type PollUnconfiguredOnusCommandInput = {
  olt_id: string
}

export type PollUnconfiguredOnusCommandOutput = {
  status: OperationStatus
  data?: DriverUnconfiguredOnu[]
  message?: string
}

