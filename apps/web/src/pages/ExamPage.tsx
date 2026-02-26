/**
 * ExamPage — 60-Item LTO Mock Exam
 *
 * Route: /quiz/exam
 * Data:  mock_exam_questions Firestore collection (me-001 to me-060)
 *
 * Procedures used:
 *   trpc.quiz.getExamPhase  — fetch 10 questions for the current phase (answers stripped)
 *   trpc.quiz.submitPhase   — grade answers server-side, return results + score
 *   (AI explanations are handled by PhaseResults via trpc.quiz.explainAnswerWithRAG)
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Loader2, XCircle } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardHeader } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { cn } from '@repo/ui/lib/utils'
import { LayoutWrapper } from '../components/LayoutWrapper'
import { PhaseResults } from '../components/PhaseResults'
import { BotIcon } from '../components/BotIcon'
import { trpc } from '../lib/trpc'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_PHASES = 6
const QUESTIONS_PER_PHASE = 10
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ---------------------------------------------------------------------------
// Types (exported — consumed by ExamResultsPage)
// ---------------------------------------------------------------------------

export interface PhaseResultItem {
  questionId: string
  domain: string
  questionText: string
  options: string[]
  selectedOptionIndex: number
  correctAnswerIndex: number
  isCorrect: boolean
  staticExplanation: string
}

export interface PhaseResult {
  score: number
  correctCount: number
  totalQuestions: number
  passed: boolean
  results: PhaseResultItem[]
}

type ExamState = 'intro' | 'answering' | 'reviewing'

// ---------------------------------------------------------------------------
// OptionButton — radio-group-style multiple choice option
//
// Behaves like a Shadcn RadioGroupItem:
//   - idle:              outlined circle, hover highlight
//   - selected:          filled circle + primary border
//   - result/correct:    emerald fill + CheckCircle icon
//   - result/wrong:      red fill + XCircle icon
//   - result/other:      faded
// ---------------------------------------------------------------------------

function OptionButton({
  label,
  text,
  selected,
  disabled,
  resultMode,
  isCorrect,
  isUserChoice,
  onClick,
}: {
  label: string
  text: string
  selected: boolean
  disabled: boolean
  resultMode: boolean
  isCorrect: boolean
  isUserChoice: boolean
  onClick: () => void
}) {
  let colorCls: string
  if (resultMode) {
    if (isCorrect) {
      colorCls = 'bg-emerald-50 border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-600'
    } else if (isUserChoice) {
      colorCls = 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600'
    } else {
      colorCls = 'border-border text-muted-foreground opacity-50'
    }
  } else if (selected) {
    colorCls = 'bg-primary/10 border-primary text-foreground font-medium'
  } else {
    colorCls =
      'border-border text-foreground hover:bg-muted hover:border-muted-foreground/40 cursor-pointer'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left px-4 py-4 rounded border text-sm transition-colors flex items-start gap-3',
        colorCls
      )}
    >
      {/* Radio circle */}
      <span
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
          resultMode && isCorrect
            ? 'border-emerald-500'
            : resultMode && isUserChoice
              ? 'border-red-500'
              : selected
                ? 'border-primary'
                : 'border-muted-foreground/40'
        )}
      >
        {!resultMode && selected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
        {resultMode && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        {resultMode && isUserChoice && !isCorrect && (
          <XCircle className="w-3.5 h-3.5 text-red-500" />
        )}
      </span>

      {/* Label + text */}
      <span className="flex items-start gap-1.5">
        <span className="font-semibold shrink-0">{label}.</span>
        <span>{text}</span>
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// ProgressBar — phase segments + per-question answered indicators
// ---------------------------------------------------------------------------

function ProgressBar({
  currentPhase,
  currentQuestionIdx,
  answeredBitmap,
}: {
  currentPhase: number
  currentQuestionIdx: number
  answeredBitmap: boolean[]
}) {
  const answeredCount = answeredBitmap.filter(Boolean).length
  const totalAnswered = currentPhase * QUESTIONS_PER_PHASE + answeredCount

  return (
    <div className="mb-6 space-y-2">
      {/* Labels row */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Phase {currentPhase + 1} of {TOTAL_PHASES}
        </span>
        <span className="text-muted-foreground">
          {totalAnswered} / {TOTAL_PHASES * QUESTIONS_PER_PHASE} answered
        </span>
      </div>

      {/* Phase segment strip */}
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_PHASES }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < currentPhase ? 'bg-primary' : i === currentPhase ? 'bg-primary/35' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Per-question answered bar for this phase */}
      <div className="flex gap-0.5">
        {answeredBitmap.map((answered, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-full transition-all duration-200',
              i === currentQuestionIdx ? 'h-2' : 'h-1.5',
              answered ? 'bg-primary' : i === currentQuestionIdx ? 'bg-primary/40' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ExamPage
// ---------------------------------------------------------------------------

export function ExamPage() {
  const navigate = useNavigate()
  const topRef = useRef<HTMLDivElement>(null)

  // ── Local state ───────────────────────────────────────────────────────────
  const [examState, setExamState] = useState<ExamState>('intro')
  const [currentPhase, setCurrentPhase] = useState(0)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
  const [phaseResults, setPhaseResults] = useState<Record<number, PhaseResult>>({})

  // ── tRPC ──────────────────────────────────────────────────────────────────
  const phaseQuery = trpc.quiz.getExamPhase.useQuery(
    { phaseIndex: currentPhase },
    { enabled: examState === 'answering', staleTime: Infinity }
  )

  const submitMutation = trpc.quiz.submitPhase.useMutation({
    onSuccess: data => {
      if (!data.success) {
        toast.error((data as { error?: string }).error ?? 'Submission failed. Please try again.')
        return
      }
      setPhaseResults(prev => ({ ...prev, [currentPhase]: data as unknown as PhaseResult }))
      setExamState('reviewing')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    },
    onError: err => {
      toast.error(err.message ?? 'Network error. Please try again.')
    },
  })

  // ── Derived ───────────────────────────────────────────────────────────────
  type RawQuestion = { id: string; domain: string; questionText: string; options: string[] }
  const questions: RawQuestion[] = (phaseQuery.data?.questions as RawQuestion[]) ?? []
  const answeredBitmap = questions.map(q => userAnswers[q.id] !== undefined)
  const answeredCount = answeredBitmap.filter(Boolean).length
  const allAnswered = questions.length > 0 && answeredBitmap.every(Boolean)
  const isLastQuestion = questions.length > 0 && currentQuestionIdx === questions.length - 1
  const currentQuestion = questions[currentQuestionIdx] ?? null

  // Reset answers + question index when entering a new phase
  useEffect(() => {
    if (examState === 'answering') {
      setUserAnswers({})
      setCurrentQuestionIdx(0)
    }
  }, [currentPhase, examState])

  // Auto-advance to next unanswered question after selection
  function handleSelectOption(questionId: string, optionIndex: number) {
    setUserAnswers(prev => {
      const updated = { ...prev, [questionId]: optionIndex }
      // Find next unanswered question
      const nextIdx = questions.findIndex(
        (q, i) => i > currentQuestionIdx && updated[q.id] === undefined
      )
      if (nextIdx !== -1) {
        setTimeout(() => setCurrentQuestionIdx(nextIdx), 350)
      }
      return updated
    })
  }

  function handleNextQuestion() {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(i => i + 1)
    }
  }

  function handlePrevQuestion() {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(i => i - 1)
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleStartExam() {
    setCurrentPhase(0)
    setPhaseResults({})
    setUserAnswers({})
    setCurrentQuestionIdx(0)
    setExamState('answering')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleSubmitPhase() {
    const answers = questions.map(q => ({
      questionId: q.id,
      selectedOptionIndex: userAnswers[q.id] ?? 0,
    }))
    submitMutation.mutate({ phaseIndex: currentPhase, answers })
  }

  function handleNextPhase() {
    if (currentPhase < TOTAL_PHASES - 1) {
      setCurrentPhase(p => p + 1)
      setExamState('answering')
    } else {
      navigate('/quiz/results', { state: { phaseResults } })
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleRetake() {
    setCurrentPhase(0)
    setPhaseResults({})
    setUserAnswers({})
    setCurrentQuestionIdx(0)
    setExamState('intro')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={topRef}>
      <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz Hub
          </button>

          {/* ================================================================
            INTRO
          ================================================================ */}
          {examState === 'intro' && (
            <div className="max-w-lg">
              <h1 className="text-xl font-semibold text-foreground mb-1">60-Item LTO Mock Exam</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Take the full mock exam in 6 phases of 10 questions each. Review results and
                explanations after every phase before continuing.
              </p>

              <Card className="shadow-none border border-border mb-6">
                <CardContent className="pt-5 space-y-2.5">
                  {[
                    ['Total questions', '60 questions'],
                    ['Format', 'Multiple choice (A – D)'],
                    ['Structure', '6 phases × 10 questions'],
                    ['Topics', 'Traffic Signs · Emergencies · Rules'],
                    ['Passing score', '80% or higher'],
                    ['AI explanations', 'Free — powered by RAG + Gemini 2.5 Flash'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-medium">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={handleStartExam} className="w-full sm:w-auto">
                Begin Phase 1 of 6
              </Button>
            </div>
          )}

          {/* ================================================================
            ANSWERING — one question at a time
          ================================================================ */}
          {examState === 'answering' && (
            <div>
              <h1 className="text-xl font-semibold text-foreground mb-4">
                Phase {currentPhase + 1}{' '}
                <span className="text-base font-normal text-muted-foreground">
                  — {QUESTIONS_PER_PHASE} questions
                </span>
              </h1>

              <ProgressBar
                currentPhase={currentPhase}
                currentQuestionIdx={currentQuestionIdx}
                answeredBitmap={answeredBitmap}
              />

              {/* Loading state */}
              {phaseQuery.isLoading && (
                <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
                  <BotIcon size="lg" className="animate-pulse" />
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading questions…
                  </div>
                </div>
              )}

              {/* Error state */}
              {phaseQuery.isError && !phaseQuery.isLoading && (
                <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
                  <BotIcon size="md" />
                  <p className="text-sm text-destructive text-center max-w-xs">
                    Failed to load questions. Please check your connection and try again.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => phaseQuery.refetch()}>
                    Retry
                  </Button>
                </div>
              )}

              {/* Single question card */}
              {!phaseQuery.isLoading && currentQuestion && (
                <>
                  <Card
                    className={cn(
                      'shadow-none border transition-colors',
                      userAnswers[currentQuestion.id] !== undefined
                        ? 'border-primary/30'
                        : 'border-border'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Question {currentPhase * QUESTIONS_PER_PHASE + currentQuestionIdx + 1} of{' '}
                          {TOTAL_PHASES * QUESTIONS_PER_PHASE}
                        </span>
                        <Badge variant="outline" className="text-xs font-normal">
                          {currentQuestion.domain}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {currentQuestion.questionText}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      {currentQuestion.options.map((opt, optIdx) => (
                        <OptionButton
                          key={optIdx}
                          label={OPTION_LABELS[optIdx]}
                          text={opt}
                          selected={userAnswers[currentQuestion.id] === optIdx}
                          disabled={false}
                          resultMode={false}
                          isCorrect={false}
                          isUserChoice={false}
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  {/* Navigation bar */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    {/* Previous */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIdx === 0}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    {/* Dot indicators */}
                    <div className="flex items-center gap-1.5">
                      {questions.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentQuestionIdx(i)}
                          aria-label={`Question ${i + 1}`}
                          className={cn(
                            'rounded-full transition-all duration-200',
                            i === currentQuestionIdx
                              ? 'w-3 h-3 bg-primary'
                              : userAnswers[q.id] !== undefined
                                ? 'w-2 h-2 bg-primary/60'
                                : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                          )}
                        />
                      ))}
                    </div>

                    {/* Next / Review & Submit / Submit */}
                    {isLastQuestion ? (
                      <Button
                        onClick={handleSubmitPhase}
                        disabled={!allAnswered || submitMutation.isPending}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          `Submit Phase ${currentPhase + 1}`
                        )}
                      </Button>
                    ) : allAnswered ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentQuestionIdx(questions.length - 1)}
                        className="flex items-center gap-1 border-primary text-primary hover:bg-primary/10"
                      >
                        Review & Submit
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIdx === questions.length - 1}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Answered status line */}
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {allAnswered ? (
                      <span className="text-emerald-600 font-medium">
                        All {QUESTIONS_PER_PHASE} answered ✓ — navigate to the last question to
                        submit
                      </span>
                    ) : (
                      <>
                        {answeredCount} of {QUESTIONS_PER_PHASE} answered
                      </>
                    )}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ================================================================
            REVIEWING
          ================================================================ */}
          {examState === 'reviewing' && phaseResults[currentPhase] && (
            <PhaseResults
              result={phaseResults[currentPhase]}
              currentPhase={currentPhase}
              onNextPhase={handleNextPhase}
              onRetake={handleRetake}
            />
          )}
        </div>
      </LayoutWrapper>
    </div>
  )
}
