-- Drop auxiliary Settings tables no longer used
-- WARNING: Destructive. Ensure backups before running in production.

DROP TABLE IF EXISTS onu_types CASCADE;
DROP TABLE IF EXISTS speed_profiles CASCADE;
DROP TABLE IF EXISTS odbs CASCADE;

