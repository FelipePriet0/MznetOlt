-- Drop graph-related series tables and snapshots
-- WARNING: This is destructive. Ensure backups before running in production.

DROP TABLE IF EXISTS onu_signal_samples CASCADE;
DROP TABLE IF EXISTS onu_traffic_samples CASCADE;
DROP TABLE IF EXISTS uplink_samples CASCADE;
DROP TABLE IF EXISTS olt_health_samples CASCADE;
DROP TABLE IF EXISTS onu_status_snapshots CASCADE;

