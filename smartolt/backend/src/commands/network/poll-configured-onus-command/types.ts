import type { OperationStatus, DriverConfiguredOnu } from '../../../drivers/olt/base-driver'

export type PollConfiguredOnusCommandInput = {
  olt_id: string
}

export type PollConfiguredOnusCommandOutput = {
  status: OperationStatus
  data?: DriverConfiguredOnu[]
  message?: string
}

