/**
 * Telemetry Job
 *
 * Periodically collects telemetry data from all OLTs:
 * - Device health metrics
 * - PON port statistics
 * - ONU connection status
 * - Network performance data
 *
 * Runs every: [5 minutes] (configurable)
 * Triggered by: Job queue scheduler
 */

export async function telemetryJob() {
  console.log('[Telemetry Job] Starting telemetry collection...')

  // TODO: Load all OLTs from database
  // TODO: For each OLT:
  //   - Connect to device via driver
  //   - Collect health metrics
  //   - Collect PON port statistics
  //   - Collect ONU status
  // TODO: Store metrics in database
  // TODO: Send alerts if thresholds exceeded
  // TODO: Graceful error handling

  console.log('[Telemetry Job] Waiting for implementation...')
}
