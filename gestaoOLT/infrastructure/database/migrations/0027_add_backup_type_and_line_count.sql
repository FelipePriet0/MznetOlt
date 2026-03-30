-- Migration 0027: Add backup_type and line_count to olt_backups
ALTER TABLE olt_backups
  ADD COLUMN IF NOT EXISTS backup_type TEXT    NOT NULL DEFAULT 'manual', -- 'manual' | 'automático'
  ADD COLUMN IF NOT EXISTS line_count  INTEGER;
