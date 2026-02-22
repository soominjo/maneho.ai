import { z } from 'zod'

export const ExamQuizSchema = z.object({
  category: z.enum(['non-professional', 'professional', 'student', 'renewal', 'special-rights']),
})

export type ExamQuiz = z.infer<typeof ExamQuizSchema>
