import { z } from 'zod'

export const ListOnusInputSchema = z.object({
  olt_id:       z.number().int().positive().optional(),
  board_id:     z.number().int().positive().optional(),
  pon_port_id:  z.number().int().positive().optional(),
  status:       z.string().optional(),
  admin_state:  z.string().optional(),
  serial_number: z.string().optional(),
  search:       z.string().optional(),
  zone_id:      z.number().int().positive().optional(),
  onu_type_id:  z.number().int().positive().optional(),
  // Multi-select topology
  olt_ids:      z.array(z.number().int().positive()).optional(),
  board_ids:    z.array(z.number().int().positive()).optional(),
  pon_port_ids: z.array(z.number().int().positive()).optional(),
  zone_ids:     z.array(z.number().int().positive()).optional(),
  onu_type_ids: z.array(z.number().int().positive()).optional(),
  // Service column filters
  pon_type_in:       z.array(z.string()).optional(),
  vlan_ids:          z.array(z.number().int()).optional(),
  mode_in:           z.array(z.string()).optional(),
  download_profiles: z.array(z.string()).optional(),
  upload_profiles:   z.array(z.string()).optional(),
  profile_in:        z.array(z.string()).optional(),
  tr069_enabled:     z.boolean().optional(),
  catv_enabled:      z.boolean().optional(),
  mgmt_ip_filter:    z.enum(['with', 'without']).optional(),
  odb_filter:        z.enum(['with', 'without']).optional(),
  // Status/signal
  status_in:    z.array(z.string()).optional(),
  admin_state_in: z.array(z.string()).optional(),
  signal_levels: z.array(z.enum(['good', 'warning', 'critical'])).optional(),
  page:      z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
})

export const OnuItemSchema = z.object({
  id: z.number(),
  serial_number: z.string(),
  status: z.string(),
  admin_state: z.string(),
  last_known_signal: z.number().nullable(),
  last_seen_at: z.string().nullable(),
  olt_id: z.number(),
  olt_name: z.string(),
  board_id: z.number(),
  board_name: z.string(),
  pon_port_id: z.number(),
  pon_port_name: z.string(),
  onu_type_id: z.number().nullable(),
  onu_vendor: z.string().nullable(),
  onu_model: z.string().nullable(),
  created_at: z.string(),
})

export const ListOnusOutputSchema = z.object({
  items: z.array(OnuItemSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})
