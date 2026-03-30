import { z } from 'zod'

export const GetOnuDetailsInputSchema = z.object({
  id: z.number().int().positive(),
})

export const GetOnuDetailsOutputSchema = z.object({
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
  board_slot_index: z.number(),
  pon_port_id: z.number(),
  pon_port_name: z.string(),
  pon_index: z.number(),
  onu_type_id: z.number().nullable(),
  onu_vendor: z.string().nullable(),
  onu_model: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
