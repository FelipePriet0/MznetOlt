import { executePollUnconfiguredOnusCommand } from '@/commands/network/poll-unconfigured-onus-command/service'
import type { OperationStatus } from '@/drivers/olt/base-driver'
import {
  createNetworkSyncRun,
  finalizeNetworkSyncRun,
  findOnuSnapshot,
  upsertOnuSnapshot,
  insertNetworkEvent,
} from './repository'
import type {
  RunUnconfiguredOnusSyncInput,
  RunUnconfiguredOnusSyncOutput,
  RunUnconfiguredOnusSyncStats,
} from './types'

const JOB_NAME = 'poll_unconfigured_onus'

export async function runUnconfiguredOnusSyncService(
  input: RunUnconfiguredOnusSyncInput
): Promise<RunUnconfiguredOnusSyncOutput> {
  const startedAt = new Date()
  const startedAtIso = startedAt.toISOString()

  const stats: RunUnconfiguredOnusSyncStats = {
    total_observed: 0,
    total_inserted: 0,
    total_updated: 0,
    total_events: 0,
    duration_ms: 0,
  }

  const runId = await createNetworkSyncRun({
    olt_id: input.olt_id,
    job_name: JOB_NAME,
    started_at: startedAtIso,
  })

  try {
    const pollResult = await executePollUnconfiguredOnusCommand({
      olt_id: String(input.olt_id),
    })

    if (pollResult.status !== 'executed' || !pollResult.data) {
      return await finalize(pollResult.status === 'executed' ? 'failed' : pollResult.status)
    }

    stats.total_observed = pollResult.data.length

    for (const onu of pollResult.data) {
      const serial = onu.serialNumber
      const previousSnapshot = await findOnuSnapshot(input.olt_id, serial)

      const currentStatus: string | null = 'unconfigured'
      const currentSignal: number | null = null
      const currentSeen =
        typeof onu.detectedAt === 'string' && onu.detectedAt.trim().length > 0
          ? onu.detectedAt
          : new Date().toISOString()

      const snapshot = await upsertOnuSnapshot({
        olt_id: input.olt_id,
        onu_serial: serial,
        source: 'unconfigured_poll',
        last_known_status: currentStatus,
        last_known_signal: currentSignal,
        last_seen_at: currentSeen,
        raw_snapshot: onu,
      })

      if (!previousSnapshot) {
        stats.total_inserted += 1

        await insertNetworkEvent({
          olt_id: input.olt_id,
          onu_serial: serial,
          event_type: 'ONU_UNCONFIGURED_DISCOVERED',
          current_state: {
            last_known_status: currentStatus,
            last_seen_at: currentSeen,
          },
          payload: {
            snapshot,
            observed_onu: onu,
          },
        })

        stats.total_events += 1
        continue
      }

      stats.total_updated += 1

      if (previousSnapshot.source !== 'unconfigured_poll') {
        await insertNetworkEvent({
          olt_id: input.olt_id,
          onu_serial: serial,
          event_type: 'ONU_BECAME_UNCONFIGURED',
          previous_state: {
            source: previousSnapshot.source,
            last_known_status: previousSnapshot.last_known_status,
            last_seen_at: previousSnapshot.last_seen_at,
          },
          current_state: {
            source: 'unconfigured_poll',
            last_known_status: currentStatus,
            last_seen_at: currentSeen,
          },
          payload: {
            snapshot,
            observed_onu: onu,
          },
        })

        stats.total_events += 1
      }
    }

    return await finalize('executed')
  } catch {
    return await finalize('unknown_error')
  }

  async function finalize(finalStatus: OperationStatus): Promise<RunUnconfiguredOnusSyncOutput> {
    const finishedAt = new Date()
    stats.duration_ms = finishedAt.getTime() - startedAt.getTime()

    if (runId !== null) {
      await finalizeNetworkSyncRun({
        run_id: runId,
        status: finalStatus,
        finished_at: finishedAt.toISOString(),
        duration_ms: stats.duration_ms,
        stats_json: {
          total_observed: stats.total_observed,
          total_inserted: stats.total_inserted,
          total_updated: stats.total_updated,
          total_events: stats.total_events,
          duration_ms: stats.duration_ms,
        },
      })
    }

    return {
      status: finalStatus,
      run_id: runId,
      stats,
    }
  }
}