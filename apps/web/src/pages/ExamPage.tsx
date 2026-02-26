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
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { cn } from '@repo/ui/lib/utils'
import { LayoutWrapper } from '../components/LayoutWrapper'
import { PhaseResults } from '../components/PhaseResults'
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
//   - idle:         outlined circle, hover highlight
//   - selected:     filled circle + primary border
//   - result/correct:   emerald fill + CheckCircle icon
//   - result/wrong choice: red fill + XCircle icon
//   - result/other:     faded
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
        'w-full text-left px-4 py-3 rounded border text-sm transition-colors flex items-start gap-3',
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
// ProgressBar — shows overall exam progress + phase segment strip
// ---------------------------------------------------------------------------

function ProgressBar({
  currentPhase,
  answeredCount,
}: {
  currentPhase: number
  answeredCount: number
}) {
  const totalAnswered = currentPhase * QUESTIONS_PER_PHASE + answeredCount
  const pct = Math.round((totalAnswered / (TOTAL_PHASES * QUESTIONS_PER_PHASE)) * 100)

  return (
    <div className="mb-6 space-y-2">
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

      {/* Thin overall progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
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
  const answeredCount = Object.keys(userAnswers).length
  const allAnswered = questions.length > 0 && questions.every(q => userAnswers[q.id] !== undefined)

  // Reset user answers when entering a new phase
  useEffect(() => {
    if (examState === 'answering') {
      setUserAnswers({})
    }
  }, [currentPhase, examState])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleStartExam() {
    setCurrentPhase(0)
    setPhaseResults({})
    setUserAnswers({})
    setExamState('answering')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleSelectOption(questionId: string, optionIndex: number) {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
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
            ANSWERING
        ================================================================ */}
          {examState === 'answering' && (
            <div className="max-w-2xl">
              <h1 className="text-xl font-semibold text-foreground mb-4">
                Phase {currentPhase + 1}{' '}
                <span className="text-base font-normal text-muted-foreground">
                  — {QUESTIONS_PER_PHASE} questions
                </span>
              </h1>

              <ProgressBar currentPhase={currentPhase} answeredCount={answeredCount} />

              {/* Loading skeleton */}
              {phaseQuery.isLoading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="shadow-none border border-border">
                      <CardContent className="pt-5 space-y-3">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="h-11 bg-muted animate-pulse rounded" />
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error state */}
              {phaseQuery.isError && !phaseQuery.isLoading && (
                <Card className="shadow-none border border-destructive/30">
                  <CardContent className="pt-5">
                    <p className="text-sm text-destructive mb-3">
                      Failed to load questions. Please check your connection and try again.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => phaseQuery.refetch()}>
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Question cards */}
              {!phaseQuery.isLoading && questions.length > 0 && (
                <>
                  <div className="space-y-5">
                    {questions.map((question, qIdx) => {
                      const selected = userAnswers[question.id]
                      const globalNum = currentPhase * QUESTIONS_PER_PHASE + qIdx + 1

                      return (
                        <Card
                          key={question.id}
                          className={cn(
                            'shadow-none border transition-colors',
                            selected !== undefined ? 'border-primary/30' : 'border-border'
                          )}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-1">
                              <CardTitle className="text-xs font-normal text-muted-foreground">
                                Question {globalNum} of {TOTAL_PHASES * QUESTIONS_PER_PHASE}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs font-normal">
                                {question.domain}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                              {question.questionText}
                            </p>
                          </CardHeader>

                          {/* Radio-group-style options */}
                          <CardContent className="space-y-2">
                            {question.options.map((opt, optIdx) => (
                              <OptionButton
                                key={optIdx}
                                label={OPTION_LABELS[optIdx]}
                                text={opt}
                                selected={selected === optIdx}
                                disabled={false}
                                resultMode={false}
                                isCorrect={false}
                                isUserChoice={false}
                                onClick={() => handleSelectOption(question.id, optIdx)}
                              />
                            ))}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Sticky submit bar */}
                  <div className="sticky bottom-4 mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-background/95 backdrop-blur border border-border rounded px-4 py-3 shadow-sm">
                    <p className="flex-1 text-sm text-muted-foreground">
                      {allAnswered ? (
                        <span className="text-emerald-600 font-medium">
                          All {QUESTIONS_PER_PHASE} questions answered ✓
                        </span>
                      ) : (
                        <>
                          <span className="font-medium text-foreground">
                            {QUESTIONS_PER_PHASE - answeredCount}
                          </span>{' '}
                          question{QUESTIONS_PER_PHASE - answeredCount !== 1 ? 's' : ''} remaining
                        </>
                      )}
                    </p>
                    <Button
                      onClick={handleSubmitPhase}
                      disabled={!allAnswered || submitMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {submitMutation.isPending
                        ? 'Submitting…'
                        : `Submit Phase ${currentPhase + 1}`}
                    </Button>
                  </div>
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
