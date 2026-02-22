import { z } from 'zod'

export const TicketDecoderSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
})

export type TicketDecoder = z.infer<typeof TicketDecoderSchema>
