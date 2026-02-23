import { z } from 'zod'

// --- Input schemas for tRPC procedures ---

export const ListThreadsSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().min(1).max(50).default(20),
})

export const GetThreadSchema = z.object({
  userId: z.string().min(1),
  threadId: z.string().min(1),
})

export const RenameThreadSchema = z.object({
  userId: z.string().min(1),
  threadId: z.string().min(1),
  title: z.string().min(1).max(100),
})

export const DeleteThreadSchema = z.object({
  userId: z.string().min(1),
  threadId: z.string().min(1),
})

export const AskLawyerWithThreadSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(2000, 'Query too long'),
  userId: z.string().min(1),
  threadId: z.string().optional(),
})
export type AskLawyerWithThread = z.infer<typeof AskLawyerWithThreadSchema>
