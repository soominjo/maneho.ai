/**
 * PhaseResults — per-phase review panel rendered inside ExamPage
 *
 * Responsibilities:
 *  - Display a score summary card (pass / fail)
 *  - Show each question with green ✓ / red ✗ answer highlighting
 *  - Provide a collapsible static explanation for every question
 *  - For wrong answers: "Explain this with AI" button that calls
 *    trpc.quiz.explainAnswerWithRAG and shows the result in a Shadcn Alert
 *  - "Proceed to Next Phase" / "Finish Exam" CTA at the bottom
 */

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardHeader } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { cn } from '@repo/ui/lib/utils'
import { trpc } from '../lib/trpc'
import { toast } from 'sonner'
import type { PhaseResult, PhaseResultItem } from '../pages/ExamPage'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_PHASES = 6
const QUESTIONS_PER_PHASE = 10
const PASSING_SCORE_PCT = 80
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ---------------------------------------------------------------------------
// OptionButton — result-mode only (read-only, colour-coded)
// ---------------------------------------------------------------------------

function OptionButton({
  label,
  text,
  isCorrect,
  isUserChoice,
}: {
  label: string
  text: string
  isCorrect: boolean
  isUserChoice: boolean
}) {
  let colorCls: string
  if (isCorrect) {
    colorCls = 'bg-emerald-50 border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-600'
  } else if (isUserChoice) {
    colorCls = 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600'
  } else {
    colorCls = 'border-border text-muted-foreground opacity-50'
  }

  return (
    <div
      className={cn(
        'w-full text-left px-4 py-3 rounded border text-sm flex items-start gap-3',
        colorCls
      )}
    >
      <span
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
          isCorrect
            ? 'border-emerald-500'
            : isUserChoice
              ? 'border-red-500'
              : 'border-muted-foreground/40'
        )}
      >
        {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        {isUserChoice && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-500" />}
      </span>
      <span className="flex items-start gap-1.5">
        <span className="font-semibold shrink-0">{label}.</span>
        <span>{text}</span>
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PhaseResults
// ---------------------------------------------------------------------------

interface PhaseResultsProps {
  result: PhaseResult
  currentPhase: number
  onNextPhase: () => void
  onRetake: () => void
}

export function PhaseResults({ result, currentPhase, onNextPhase, onRetake }: PhaseResultsProps) {
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set())
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({})
  const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({})

  const explainMutation = trpc.quiz.explainAnswerWithRAG.useMutation()

  function toggleExplanation(questionId: string) {
    setExpandedExplanations(prev => {
      const next = new Set(prev)
      next.has(questionId) ? next.delete(questionId) : next.add(questionId)
      return next
    })
  }

  function handleExplainAnswer(item: PhaseResultItem) {
    const userAnswerText = item.options[item.selectedOptionIndex] ?? ''
    const correctAnswerText = item.options[item.correctAnswerIndex] ?? ''

    setLoadingExplanations(prev => ({ ...prev, [item.questionId]: true }))

    explainMutation.mutate(
      {
        questionText: item.questionText,
        userAnswer: userAnswerText,
        correctAnswer: correctAnswerText,
      },
      {
        onSuccess: data => {
          if (data.success && data.explanation) {
            setAiExplanations(prev => ({ ...prev, [item.questionId]: data.explanation }))
          } else if (!data.success) {
            toast.error((data as { error?: string }).error ?? 'Failed to get AI explanation.')
          }
          setLoadingExplanations(prev => ({ ...prev, [item.questionId]: false }))
        },
        onError: err => {
          toast.error(err.message ?? 'Failed to get AI explanation.')
          setLoadingExplanations(prev => ({ ...prev, [item.questionId]: false }))
        },
      }
    )
  }

  const isLastPhase = currentPhase >= TOTAL_PHASES - 1

  return (
    <div className="max-w-2xl">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <h1 className="text-xl font-semibold text-foreground mb-1">
        Phase {currentPhase + 1} Results
      </h1>
      <p className="text-sm text-muted-foreground mb-5">
        Correct answers are highlighted in green; your wrong pick is in red. Use{' '}
        <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
          <Sparkles className="w-3 h-3" />
          Explain this with AI
        </span>{' '}
        on any wrong answer for a RAG-grounded breakdown.
      </p>

      {/* ── Score card ──────────────────────────────────────────────────────── */}
      <Card
        className={cn(
          'shadow-none mb-5',
          result.passed
            ? 'border-emerald-300 dark:border-emerald-700'
            : 'border-red-300 dark:border-red-700'
        )}
      >
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground leading-none">
                {result.correctCount}
                <span className="text-lg font-normal text-muted-foreground">
                  /{result.totalQuestions}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">correct answers</p>
            </div>
            <div className="text-right">
              <Badge
                className={cn(
                  'text-sm px-3 py-1',
                  result.passed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-300'
                )}
              >
                {result.score}% — {result.passed ? 'PASSED' : 'FAILED'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {result.passed
                  ? `Above the ${PASSING_SCORE_PCT}% pass mark`
                  : `Need ${PASSING_SCORE_PCT - result.score}% more to pass`}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  result.passed ? 'bg-emerald-500' : 'bg-red-500'
                )}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-amber-600">80% pass mark</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Per-question review cards ────────────────────────────────────────── */}
      <div className="space-y-4 mb-6">
        {result.results.map((item, idx) => (
          <Card
            key={item.questionId}
            className={cn(
              'shadow-none',
              item.isCorrect
                ? 'border-emerald-200 dark:border-emerald-800'
                : 'border-red-200 dark:border-red-800'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                {item.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      Q{currentPhase * QUESTIONS_PER_PHASE + idx + 1}
                    </span>
                    {item.domain && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {item.domain}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {item.questionText}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Options with result colouring */}
              {item.options.map((opt, optIdx) => (
                <OptionButton
                  key={optIdx}
                  label={OPTION_LABELS[optIdx]}
                  text={opt}
                  isCorrect={optIdx === item.correctAnswerIndex}
                  isUserChoice={optIdx === item.selectedOptionIndex}
                />
              ))}

              {/* Static explanation — collapsible */}
              <button
                onClick={() => toggleExplanation(item.questionId)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 mt-1 border-t border-border w-full text-left"
              >
                {expandedExplanations.has(item.questionId) ? (
                  <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                )}
                {expandedExplanations.has(item.questionId)
                  ? 'Hide explanation'
                  : 'Show explanation'}
              </button>

              {expandedExplanations.has(item.questionId) && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded p-3">
                  {item.staticExplanation}
                </p>
              )}

              {/* RAG AI explanation — wrong answers only */}
              {!item.isCorrect && (
                <div className="mt-1 pt-2 border-t border-border">
                  {aiExplanations[item.questionId] ? (
                    /* ── AI explanation — Shadcn Alert ── */
                    <Alert variant="info">
                      <Sparkles className="w-4 h-4" />
                      <AlertTitle className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        AI Explanation (RAG-grounded)
                      </AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line mt-1">
                        {aiExplanations[item.questionId]}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    /* ── Trigger button ── */
                    <button
                      onClick={() => handleExplainAnswer(item)}
                      disabled={loadingExplanations[item.questionId]}
                      className={cn(
                        'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors',
                        loadingExplanations[item.questionId]
                          ? 'border-border text-muted-foreground cursor-not-allowed opacity-60'
                          : 'border-primary/30 text-primary hover:bg-primary/5 cursor-pointer'
                      )}
                    >
                      {loadingExplanations[item.questionId] ? (
                        <>
                          <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
                          Getting AI explanation…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 shrink-0" />
                          Explain this with AI
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Phase navigation ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onNextPhase} className="w-full sm:w-auto">
          {isLastPhase
            ? 'Finish Exam & View Final Score'
            : `Proceed to Phase ${currentPhase + 2} of ${TOTAL_PHASES}`}
        </Button>
        <Button variant="outline" onClick={onRetake} className="w-full sm:w-auto gap-2">
          <RotateCcw className="w-4 h-4" />
          Restart Exam
        </Button>
      </div>
    </div>
  )
}
