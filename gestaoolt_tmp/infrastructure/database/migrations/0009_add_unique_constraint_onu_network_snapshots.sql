ALTER TABLE onu_network_snapshots
ADD CONSTRAINT onu_network_snapshots_olt_id_onu_serial_key
UNIQUE (olt_id, onu_serial);
