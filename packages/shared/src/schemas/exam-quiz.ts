import { z } from 'zod'

const LicenseCategory = z.enum([
  'non-professional',
  'professional',
  'student',
  'renewal',
  'special-rights',
])

export const ExamQuizSchema = z.object({
  category: LicenseCategory,
})

export const ReviewerModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  domain: z.string(),
  content: z.string(),
  category: LicenseCategory,
})

export const QuizQuestionSchema = z.object({
  id: z.string(),
  domain: z.string(),
  questionText: z.string(),
  options: z.array(z.string()),
  correctAnswerIndex: z.number().int().min(0),
  staticExplanation: z.string(),
})

export const QuizPhaseSubmitSchema = z.object({
  phaseIndex: z.number().int().min(0),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIndex: z.number().int().min(0),
    })
  ),
})

export type ExamQuiz = z.infer<typeof ExamQuizSchema>
export type ReviewerModule = z.infer<typeof ReviewerModuleSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type QuizPhaseSubmit = z.infer<typeof QuizPhaseSubmitSchema>
