import { z } from 'zod'

export const CreateOltInputSchema = z.object({
  name: z.string().min(1),
  vendor: z.string().min(1),
  mgmt_ip: z.string().min(1),
  location_id: z.number().int().positive(),
  zone_id: z.number().int().positive(),
})

export const CreateOltOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  vendor: z.string(),
  mgmt_ip: z.string(),
  location_id: z.number(),
  zone_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})
