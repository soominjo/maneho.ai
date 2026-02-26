import { router } from './trpc'
import { userRouter } from './routers/user'
import { ragRouter } from './routers/rag'
import { adminRouter } from './routers/admin'
import { chatHistoryRouter } from './routers/chat-history'
import { quizRouter } from './routers/quiz'

export const appRouter = router({
  user: userRouter,
  rag: ragRouter,
  admin: adminRouter,
  chatHistory: chatHistoryRouter,
  quiz: quizRouter,
})

export type AppRouter = typeof appRouter
