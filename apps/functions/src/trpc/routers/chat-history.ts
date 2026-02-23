/**
 * Chat History tRPC Router
 * Handles thread listing, loading, renaming, and deletion
 */
import { router, publicProcedure } from '../trpc'
import {
  ListThreadsSchema,
  GetThreadSchema,
  RenameThreadSchema,
  DeleteThreadSchema,
} from '@repo/shared'
import * as threadStorage from '../../lib/thread-storage'

export const chatHistoryRouter = router({
  /**
   * List all threads for a user (sidebar data)
   */
  listThreads: publicProcedure.input(ListThreadsSchema).query(async ({ input }) => {
    const threads = await threadStorage.listThreads(input.userId, input.limit)
    return { threads }
  }),

  /**
   * Get a single thread with all its messages
   */
  getThread: publicProcedure.input(GetThreadSchema).query(async ({ input }) => {
    const thread = await threadStorage.getThread(input.userId, input.threadId)
    if (!thread) {
      throw new Error('Thread not found')
    }
    const messages = await threadStorage.getThreadMessages(input.userId, input.threadId)
    return { thread, messages }
  }),

  /**
   * Rename a thread
   */
  renameThread: publicProcedure.input(RenameThreadSchema).mutation(async ({ input }) => {
    await threadStorage.renameThread(input.userId, input.threadId, input.title)
    return { success: true }
  }),

  /**
   * Delete a thread and all its messages
   */
  deleteThread: publicProcedure.input(DeleteThreadSchema).mutation(async ({ input }) => {
    await threadStorage.deleteThread(input.userId, input.threadId)
    return { success: true }
  }),
})
