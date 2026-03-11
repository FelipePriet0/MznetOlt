import { z } from 'zod'

export const ListUnconfiguredOnusInputSchema = z.object({
  olt_id: z.number().int().positive().optional(),
  board_id: z.number().int().positive().optional(),
  pon_port_id: z.number().int().positive().optional(),
  serial_number: z.string().optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
})

export const UnconfiguredOnuItemSchema = z.object({
  id: z.number(),
  serial_number: z.string(),
  olt_id: z.number(),
  olt_name: z.string(),
  board_id: z.number(),
  board_name: z.string(),
  pon_port_id: z.number(),
  pon_port_name: z.string(),
  status: z.string(),
  admin_state: z.string(),
  last_known_signal: z.number().nullable(),
  last_seen_at: z.string().nullable(),
  created_at: z.string(),
})

export const ListUnconfiguredOnusOutputSchema = z.object({
  items: z.array(UnconfiguredOnuItemSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})
