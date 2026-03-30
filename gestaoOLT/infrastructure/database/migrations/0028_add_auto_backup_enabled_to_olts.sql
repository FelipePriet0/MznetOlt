-- Migration 0028: Add auto_backup_enabled flag to olts
ALTER TABLE olts
  ADD COLUMN IF NOT EXISTS auto_backup_enabled BOOLEAN NOT NULL DEFAULT false;
