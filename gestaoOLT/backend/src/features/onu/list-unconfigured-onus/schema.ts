import { z } from 'zod'

export const ListUnconfiguredOnusInputSchema = z.object({
  olt_id: z.number().int().positive().optional(),
  board_id: z.number().int().positive().optional(),
  pon_port_id: z.number().int().positive().optional(),
  serial_number: z.string().min(1).optional(),
  page: z.number().int().positive().default(1),
  page_size: z.number().int().positive().max(2000).default(1000),
})

export const UnconfiguredOnuItemSchema = z.object({
  id: z.number().int(),
  serial_number: z.string(),
  olt_id: z.number().int(),
  olt_name: z.string(),
  board_id: z.number().int(),
  board_name: z.string(),
  pon_port_id: z.number().int(),
  pon_port_name: z.string(),
  pon_port_description: z.string().nullable(),
  pon_type: z.string().nullable(),
  onu_vendor: z.string().nullable().optional(),
  onu_model: z.string().nullable().optional(),
  status: z.string(),
  admin_state: z.string(),
  last_known_signal: z.number().nullable(),
  last_seen_at: z.string().nullable(),
  created_at: z.string(),
})

export const ListUnconfiguredOnusOutputSchema = z.object({
  items: z.array(UnconfiguredOnuItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
})

