import { z } from 'zod'

export const ListOnusInputSchema = z.object({
  olt_id: z.number().int().positive().optional(),
  board_id: z.number().int().positive().optional(),
  pon_port_id: z.number().int().positive().optional(),
  status: z.string().optional(),
  admin_state: z.string().optional(),
  serial_number: z.string().optional(),
  page: z.number().int().min(1).default(1),
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
