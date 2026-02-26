/**
 * ExamResultsPage — Phase 6: Final Diagnostics Dashboard
 *
 * Receives all 6 phase results via React Router state from ExamPage.
 * Shows:
 *  - Overall score + pass/fail verdict
 *  - Per-domain performance breakdown with visual bars
 *  - Weak areas list with direct "Review" links to the Reviewer
 *  - Phase-by-phase breakdown table
 */
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
  Trophy,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { cn } from '@repo/ui/lib/utils'
import { LayoutWrapper } from '../components/LayoutWrapper'
import type { PhaseResult, PhaseResultItem } from './ExamPage'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_PHASES = 6
const QUESTIONS_PER_PHASE = 10
const PASSING_SCORE_PCT = 80

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DomainStat {
  domain: string
  correct: number
  total: number
  pct: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function domainBarColor(pct: number): string {
  if (pct >= 90) return 'bg-emerald-500'
  if (pct >= PASSING_SCORE_PCT) return 'bg-primary'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function domainBadgeClass(pct: number): string {
  if (pct >= 90)
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300'
  if (pct >= PASSING_SCORE_PCT)
    return 'bg-blue-100 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300'
  if (pct >= 50) return 'bg-amber-100 text-amber-800 dark:bg-amber-800/40 dark:text-amber-300'
  return 'bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-300'
}

// ---------------------------------------------------------------------------
// ExamResultsPage
// ---------------------------------------------------------------------------

export function ExamResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { phaseResults?: Record<number, PhaseResult> } | null
  const phaseResults: Record<number, PhaseResult> = state?.phaseResults ?? {}
  const hasData = Object.keys(phaseResults).length > 0

  // Redirect if opened without exam data
  useEffect(() => {
    if (!hasData) {
      navigate('/quiz', { replace: true })
    }
  }, [hasData, navigate])

  if (!hasData) return null

  // ── Analytics ──────────────────────────────────────────────────────────────
  const allResults: PhaseResultItem[] = Object.values(phaseResults).flatMap(r => r.results)
  const totalCorrect = allResults.filter(r => r.isCorrect).length
  const totalQuestions = allResults.length
  const overallPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const overallPassed = overallPct >= PASSING_SCORE_PCT

  // Domain breakdown — grouped and sorted by worst performance first
  const domainMap = new Map<string, { correct: number; total: number }>()
  for (const result of allResults) {
    if (!result.domain) continue
    const entry = domainMap.get(result.domain) ?? { correct: 0, total: 0 }
    domainMap.set(result.domain, {
      correct: entry.correct + (result.isCorrect ? 1 : 0),
      total: entry.total + 1,
    })
  }

  const domainStats: DomainStat[] = Array.from(domainMap.entries())
    .map(([domain, { correct, total }]) => ({
      domain,
      correct,
      total,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct) // worst first

  const weakDomains = domainStats.filter(d => d.pct < PASSING_SCORE_PCT)

  // Phase breakdown
  const phaseList = Array.from({ length: TOTAL_PHASES }, (_, i) => ({
    phase: i,
    result: phaseResults[i] ?? null,
  }))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/quiz')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded"
          aria-label="Back to Quiz Hub"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Exam Results</h1>
          <p className="text-sm text-muted-foreground">Your LTO mock exam diagnostic report</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Overall score card ────────────────────────────────────────────── */}
        <Card
          className={cn(
            'shadow-none',
            overallPassed
              ? 'border-emerald-300 dark:border-emerald-700'
              : 'border-red-300 dark:border-red-700'
          )}
        >
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
                    overallPassed
                      ? 'bg-emerald-100 dark:bg-emerald-900/40'
                      : 'bg-red-100 dark:bg-red-900/40'
                  )}
                >
                  {overallPassed ? (
                    <Trophy className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground leading-none">
                    {totalCorrect}
                    <span className="text-xl font-normal text-muted-foreground">
                      /{TOTAL_PHASES * QUESTIONS_PER_PHASE}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">total correct answers</p>
                </div>
              </div>
              <Badge
                className={cn(
                  'text-sm px-3 py-1.5 shrink-0',
                  overallPassed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-300'
                )}
              >
                {overallPct}% — {overallPassed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>

            {/* Score bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Overall score</span>
                <span>{overallPct}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    overallPassed ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {overallPassed
                  ? `You passed! You exceeded the ${PASSING_SCORE_PCT}% required passing mark.`
                  : `You need ${PASSING_SCORE_PCT}% to pass. You were ${PASSING_SCORE_PCT - overallPct}% short. Keep studying!`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Domain breakdown ─────────────────────────────────────────────── */}
        <Card className="shadow-none border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance by Topic Domain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {domainStats.length === 0 && (
              <p className="text-sm text-muted-foreground">No domain data available.</p>
            )}
            {domainStats.map(d => (
              <div key={d.domain} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {d.pct >= PASSING_SCORE_PCT ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground">{d.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {d.correct}/{d.total}
                    </span>
                    <Badge className={cn('text-xs px-2 py-0.5', domainBadgeClass(d.pct))}>
                      {d.pct}%
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      domainBarColor(d.pct)
                    )}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground border-t border-border">
              {[
                { color: 'bg-emerald-500', label: '≥ 90% Excellent' },
                { color: 'bg-primary', label: '80–89% Passed' },
                { color: 'bg-amber-500', label: '50–69% Needs work' },
                { color: 'bg-red-500', label: '< 50% Review required' },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', item.color)} />
                  {item.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Phase breakdown ───────────────────────────────────────────────── */}
        <Card className="shadow-none border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Phase Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {phaseList.map(({ phase, result }) =>
              result ? (
                <div
                  key={phase}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded border text-sm',
                    result.passed
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                  )}
                >
                  <span className="font-medium text-foreground">Phase {phase + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {result.correctCount}/{result.totalQuestions}
                    </span>
                    <Badge
                      className={cn(
                        'text-xs',
                        result.passed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-300'
                      )}
                    >
                      {result.score}%
                    </Badge>
                  </div>
                </div>
              ) : null
            )}
          </CardContent>
        </Card>

        {/* ── Weak areas — Call to Action ───────────────────────────────────── */}
        {weakDomains.length > 0 && (
          <Card className="shadow-none border border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Review Weak Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You scored below {PASSING_SCORE_PCT}% in the following topics. Click{' '}
                <strong className="text-foreground">Review</strong> to jump directly to that domain
                in the Study Reviewer.
              </p>
              <div className="space-y-2.5">
                {weakDomains.map(d => (
                  <div key={d.domain} className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">
                        {d.domain}
                      </span>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-300 text-xs px-1.5 shrink-0">
                        {d.pct}%
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/quiz/reviewer', { state: { domain: d.domain } })}
                      className="text-xs gap-1.5 h-7 shrink-0"
                    >
                      <BookOpen className="w-3 h-3" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── All strong — encouragement ────────────────────────────────────── */}
        {weakDomains.length === 0 && overallPassed && (
          <Card className="shadow-none border border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Excellent work!</span> You passed all topic
                  domains. You&apos;re well-prepared for the LTO exam.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Action buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={() => navigate('/quiz/exam')} className="w-full sm:w-auto gap-2">
            <RotateCcw className="w-4 h-4" />
            Retake Exam
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/quiz/reviewer')}
            className="w-full sm:w-auto gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Open Study Reviewer
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  )
}
