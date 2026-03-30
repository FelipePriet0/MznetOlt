import { z } from 'zod'

export const AuthorizeOnuInputSchema = z.object({
  onu_id: z.number().int().positive(),
  preset_id: z.number().int().positive().optional(),
})

export const AuthorizeOnuOutputSchema = z.object({
  success: z.boolean(),
  event_id: z.number().nullable(),
})

