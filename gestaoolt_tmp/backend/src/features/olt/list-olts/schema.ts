import { z } from 'zod'

export const ListOltsInputSchema = z.object({
  vendor: z.string().optional(),
  location_id: z.number().int().positive().optional(),
  zone_id: z.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(1000).default(20),
})

export const OltItemSchema = z.object({
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

export const ListOltsOutputSchema = z.object({
  items: z.array(OltItemSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})
