import { z } from 'zod'

export const AskLawyerSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(2000, 'Query too long'),
})

export type AskLawyer = z.infer<typeof AskLawyerSchema>
