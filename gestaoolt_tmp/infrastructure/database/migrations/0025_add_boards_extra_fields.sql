ALTER TABLE boards
  ADD COLUMN board_type    TEXT,
  ADD COLUMN board_hw_id   TEXT,
  ADD COLUMN board_status  TEXT NOT NULL DEFAULT 'Normal',
  ADD COLUMN board_role    TEXT NOT NULL DEFAULT 'Normal',
  ADD COLUMN terminal_count INTEGER;
