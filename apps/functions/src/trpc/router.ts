import { router } from './trpc'
import { userRouter } from './routers/user'
import { ragRouter } from './routers/rag'
import { adminRouter } from './routers/admin'

export const appRouter = router({
  user: userRouter,
  rag: ragRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
