import { z } from 'zod'

export const GetOltDetailsInputSchema = z.object({
  id: z.number().int().positive(),
})

export const GetOltDetailsOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  vendor: z.string(),
  mgmt_ip: z.string(),
  location_id: z.number().nullable(),
  location_name: z.string().nullable(),
  zone_id: z.number().nullable(),
  zone_name: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
