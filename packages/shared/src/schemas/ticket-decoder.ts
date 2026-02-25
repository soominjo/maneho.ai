import { z } from 'zod'

export const TicketDecoderSchema = z
  .object({
    imageUrl: z.string().url('Invalid image URL').optional(),
    imageBase64: z.string().min(1).optional(),
  })
  .refine(data => data.imageUrl || data.imageBase64, {
    message: 'Either imageUrl or imageBase64 must be provided',
  })

export type TicketDecoder = z.infer<typeof TicketDecoderSchema>

export interface TicketHistory {
  id?: string
  userId: string
  imageUrl: string
  ticketText: string
  explanation: string
  ticketNumber?: string
  violationType?: string
  citations: Array<{ documentId: string; chunkText: string }>
  createdAt: Date
}
