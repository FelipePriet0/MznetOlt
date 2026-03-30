import { DriverMode, MockOLTDriver, type BaseOLTDriver } from '../../../drivers/olt/base-driver'
import type { PollUnconfiguredOnusCommandInput, PollUnconfiguredOnusCommandOutput } from './types'

function resolveDriverForOlt(_olt_id: string): BaseOLTDriver {
  return new MockOLTDriver({ mode: DriverMode.MOCK, vendor: 'mock' })
}

export async function executePollUnconfiguredOnusCommand(
  input: PollUnconfiguredOnusCommandInput
): Promise<PollUnconfiguredOnusCommandOutput> {
  if (!input.olt_id) {
    return { status: 'rejected', message: 'Missing olt_id' }
  }

  const driver = resolveDriverForOlt(input.olt_id)

  try {
    await driver.connect()
    const onus = await driver.listUnconfiguredOnus()
    return { status: 'executed', data: onus }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return { status: 'unknown_error', message }
  } finally {
    try {
      await driver.disconnect()
    } catch {}
  }
}

