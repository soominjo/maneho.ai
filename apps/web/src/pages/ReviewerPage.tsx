/**
 * ReviewerPage — LTO Study Reviewer
 *
 * Route: /quiz/reviewer
 *
 * Sidebar of LTO exam topics. On selection, fires trpc.quiz.generateStudyMaterial
 * with a hidden prompt so Gemini + RAG generates tailored, exam-focused content.
 * Results are cached per topic in component state so re-clicking is instant.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { cn } from '@repo/ui/lib/utils'
import { LayoutWrapper } from '../components/LayoutWrapper'
import { trpc } from '../lib/trpc'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Topic catalogue
// Each topic has a human-readable title, the domain name that maps to exam
// results (for "Review Weak Areas" deep-linking), and a hidden RAG prompt.
// ---------------------------------------------------------------------------

interface ReviewTopic {
  id: string
  title: string
  domain: string // matches PhaseResultItem.domain from ExamPage
  icon: string
  hiddenPrompt: string
}

const TOPICS: ReviewTopic[] = [
  {
    id: 'road-signs',
    title: 'Road Signs & Signals',
    domain: 'Traffic Signs',
    icon: '🚦',
    hiddenPrompt:
      'Summarize all Philippine road signs and traffic signals from the LTO manual. ' +
      'Group them by category (Regulatory, Warning, Guide/Informational). ' +
      'For each category, list key signs with their shape, color, and meaning. ' +
      'Include what a driver must do when they encounter each type.',
  },
  {
    id: 'right-of-way',
    title: 'Right of Way',
    domain: 'Right of Way',
    icon: '⬆️',
    hiddenPrompt:
      'Summarize the Right of Way rules from the LTO manual and RA 4136 using bullet points. ' +
      'Cover: intersections without signals, four-way stops, T-intersections, roundabouts, ' +
      'yielding to pedestrians, emergency vehicles, and school zones. ' +
      'Include the exact legal rule and a practical tip for each scenario.',
  },
  {
    id: 'speed-limits',
    title: 'Speed Limits',
    domain: 'Speed Limits',
    icon: '🚗',
    hiddenPrompt:
      'List all official speed limits in the Philippines from RA 4136 and MMDA regulations. ' +
      'Include limits for: expressways, national highways, urban roads, school zones, ' +
      'residential areas, and construction zones. ' +
      'Also cover the meaning of "safe speed" and factors affecting it.',
  },
  {
    id: 'traffic-rules',
    title: 'Traffic Rules & Regulations',
    domain: 'Traffic Rules',
    icon: '📋',
    hiddenPrompt:
      'Summarize the core traffic rules and regulations every Filipino driver must know from RA 4136. ' +
      'Cover: lane discipline, overtaking rules, U-turns, merging, use of signals/horn, ' +
      'parking rules, night driving, and one-way street rules.',
  },
  {
    id: 'fines-penalties',
    title: 'Fines & Penalties',
    domain: 'Fines & Penalties',
    icon: '💰',
    hiddenPrompt:
      'List the fines and penalties for traffic violations in the Philippines under RA 4136, ' +
      'RA 10913 (Anti-Distracted Driving), RA 8750 (Seat Belt), and MMDA regulations. ' +
      'Include specific peso amounts, license suspension/revocation rules, and repeat-offender consequences.',
  },
  {
    id: 'emergency-procedures',
    title: 'Emergency Procedures',
    domain: 'Emergencies',
    icon: '🚨',
    hiddenPrompt:
      'Explain the correct procedures a Filipino driver must follow in road emergencies. ' +
      'Cover: vehicle breakdown on the highway, road accidents (steps to follow, RA 10054), ' +
      'yielding to emergency vehicles, warning triangles and flares, and basic first aid steps ' +
      'a driver should take while waiting for help.',
  },
  {
    id: 'defensive-driving',
    title: 'Defensive Driving',
    domain: 'Defensive Driving',
    icon: '🛡️',
    hiddenPrompt:
      'Summarize defensive driving principles and techniques as taught in Philippine LTO driver education. ' +
      'Cover: the Smith System (5 keys), safe following distance, scanning and anticipating hazards, ' +
      'fatigue management, and how weather conditions affect driving.',
  },
  {
    id: 'driver-license',
    title: "Driver's License",
    domain: "Driver's License",
    icon: '🪪',
    hiddenPrompt:
      "Summarize the requirements and procedures for obtaining a Philippine driver's license from the LTO. " +
      'Cover: Student Permit requirements, Non-Professional and Professional license requirements, ' +
      'required documents, medical/drug test, written exam topics, practical driving test, ' +
      'and license renewal procedures.',
  },
  {
    id: 'vehicle-registration',
    title: 'Vehicle Registration',
    domain: 'Vehicle Registration',
    icon: '📄',
    hiddenPrompt:
      'Explain the vehicle registration process and requirements in the Philippines under LTO rules. ' +
      'Cover: new vehicle registration, annual renewal, required documents, ' +
      'MVUC fees, emission testing, TPL insurance requirement, ' +
      'penalties for expired registration, and the plate/OR/CR system.',
  },
  {
    id: 'distracted-driving',
    title: 'Anti-Distracted Driving',
    domain: 'Distracted Driving',
    icon: '📵',
    hiddenPrompt:
      'Explain RA 10913 (Anti-Distracted Driving Act) in the Philippines. ' +
      'Cover: prohibited acts while driving, definition of "mobile communications device," ' +
      'exceptions (hands-free, emergency), fine amounts for first/second/third offense, ' +
      'license suspension rules, and practical tips to stay focused while driving.',
  },
]

// ---------------------------------------------------------------------------
// ReviewerPage
// ---------------------------------------------------------------------------

export function ReviewerPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Deep-link support: ExamResultsPage passes { domain } in router state
  const routerDomain = (location.state as { domain?: string } | null)?.domain ?? null
  const defaultTopic =
    routerDomain != null ? (TOPICS.find(t => t.domain === routerDomain) ?? TOPICS[0]) : TOPICS[0]

  const [selectedId, setSelectedId] = useState<string>(defaultTopic.id)
  // Cache: topicId → generated markdown content
  const [contentCache, setContentCache] = useState<Record<string, string>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)
  // Prevent double-fire in React 18 StrictMode
  const initRef = useRef(false)

  const activeTopic = TOPICS.find(t => t.id === selectedId) ?? TOPICS[0]
  const activeContent = contentCache[selectedId] ?? null

  const generateMutation = trpc.quiz.generateStudyMaterial.useMutation({
    onSuccess: data => {
      if (data.success && data.content) {
        setContentCache(prev => ({ ...prev, [data.topicId]: data.content }))
      } else if (!data.success) {
        toast.error((data as { error?: string }).error ?? 'Failed to generate study material.')
      }
      setLoadingId(null)
    },
    onError: err => {
      toast.error(err.message ?? 'Failed to generate study material.')
      setLoadingId(null)
    },
  })

  function loadTopic(topic: ReviewTopic, forceRefresh = false) {
    setSelectedId(topic.id)
    if (!forceRefresh && contentCache[topic.id]) return // already cached
    if (loadingId === topic.id) return // already in-flight
    setLoadingId(topic.id)
    generateMutation.mutate({
      topicId: topic.id,
      topicTitle: topic.title,
      hiddenPrompt: topic.hiddenPrompt,
    })
  }

  // Auto-load the default topic on mount (initRef prevents re-fire in StrictMode)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    loadTopic(defaultTopic)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeTopicIdx = TOPICS.findIndex(t => t.id === selectedId)
  const nextTopic = TOPICS[activeTopicIdx + 1] ?? null

  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-4xl mx-auto">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/quiz')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded"
            aria-label="Back to Quiz hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">LTO Study Reviewer</h1>
            <p className="text-sm text-muted-foreground">
              AI-generated study guides grounded in official LTO documents
            </p>
          </div>
        </div>

        {/* ── Main layout: Sidebar + Content ────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <nav className="lg:w-56 shrink-0" aria-label="Study topics">
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => loadTopic(topic)}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2.5 rounded border text-sm text-left',
                    'whitespace-nowrap lg:whitespace-normal w-max lg:w-full transition-colors shrink-0 lg:shrink',
                    selectedId === topic.id
                      ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{topic.icon}</span>
                    <span>{topic.title}</span>
                  </span>
                  {loadingId === topic.id && (
                    <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0 hidden lg:block" />
                  )}
                  {selectedId === topic.id && loadingId !== topic.id && (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 hidden lg:block" />
                  )}
                </button>
              ))}
            </div>

            <p className="hidden lg:block mt-3 text-xs text-muted-foreground">
              {TOPICS.length} topics · RAG-powered
            </p>
          </nav>

          {/* ── Content panel ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Loading state */}
            {loadingId === selectedId && (
              <Card className="shadow-none border border-border">
                <CardContent className="pt-6 pb-8">
                  <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Generating study guide for <strong>{activeTopic.title}</strong>…
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      RAG is retrieving relevant LTO document chunks and Gemini is writing your
                      guide. This usually takes ~5 seconds.
                    </p>
                    <div className="w-full max-w-md mt-4 space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={cn(
                            'h-3 bg-muted animate-pulse rounded',
                            i % 3 === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-5/6' : 'w-full'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated content */}
            {loadingId !== selectedId && activeContent && (
              <Card className="shadow-none border border-border">
                <CardContent className="pt-5 pb-6">
                  {/* Content header + refresh button */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{activeTopic.icon}</span>
                      <h2 className="text-base font-semibold text-foreground">
                        {activeTopic.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => loadTopic(activeTopic, true)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                      title="Regenerate this guide"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Regenerate
                    </button>
                  </div>

                  {/* Markdown output */}
                  <div
                    className={cn(
                      'prose prose-sm max-w-none',
                      'dark:prose-invert',
                      'prose-headings:font-semibold prose-headings:text-foreground prose-headings:mt-5 prose-headings:mb-2',
                      'prose-h2:text-base prose-h3:text-sm',
                      'prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-1.5',
                      'prose-li:text-muted-foreground prose-li:my-0.5',
                      'prose-strong:text-foreground prose-strong:font-semibold',
                      'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:bg-primary/5 prose-blockquote:py-0.5 prose-blockquote:px-1 prose-blockquote:rounded-r',
                      'prose-ul:my-1.5 prose-ol:my-1.5',
                      'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-xs'
                    )}
                  >
                    <ReactMarkdown>{activeContent}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty / error state */}
            {loadingId !== selectedId && !activeContent && (
              <Card className="shadow-none border border-border">
                <CardContent className="pt-6 pb-8 flex flex-col items-center gap-3 text-center py-12">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Could not load the study guide. Please try again.
                  </p>
                  <Button size="sm" onClick={() => loadTopic(activeTopic, true)}>
                    Generate Guide
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Next topic shortcut */}
            {loadingId !== selectedId && activeContent && nextTopic && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => loadTopic(nextTopic)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  Next: {nextTopic.title}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky CTA ────────────────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Ready for the Exam?</p>
              <p className="text-xs text-muted-foreground">
                Test your knowledge with 60 LTO-style questions
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/quiz/exam')}
            className="w-full sm:w-auto gap-2 shrink-0"
          >
            Take the 60-Item Mock Test
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  )
}
