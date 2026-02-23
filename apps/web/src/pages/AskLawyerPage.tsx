import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Scale } from 'lucide-react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { CitationsPanel } from '../components/CitationsPanel'
import { ChatHistorySidebar } from '../components/ChatHistorySidebar'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

interface Citation {
  documentId: string
  chunkText: string
}

type ChatMessage =
  | { type: 'user'; content: string }
  | { type: 'ai'; content: string; citations?: Citation[]; sourceCount?: number }

export function AskLawyerPage() {
  const { user, incrementQuota, quota } = useAuth()
  const { threadId } = useParams<{ threadId?: string }>()
  const navigate = useNavigate()
  const trpcUtils = trpc.useUtils()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [lastCitations, setLastCitations] = useState<Citation[]>([])
  const [lastSourceCount, setLastSourceCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load thread messages when threadId changes
  const threadQuery = trpc.chatHistory.getThread.useQuery(
    { userId: user?.uid || '', threadId: threadId || '' },
    { enabled: !!threadId && !!user }
  )

  // Populate messages from loaded thread
  useEffect(() => {
    if (threadQuery.data) {
      const loaded: ChatMessage[] = threadQuery.data.messages.map(msg => {
        if (msg.role === 'ai') {
          return {
            type: 'ai' as const,
            content: msg.content,
            citations: msg.citations,
            sourceCount: msg.sourceCount,
          }
        }
        return { type: 'user' as const, content: msg.content }
      })
      setMessages(loaded)

      // Set citations from the last AI message
      const lastAi = [...loaded].reverse().find(m => m.type === 'ai')
      if (lastAi && lastAi.type === 'ai') {
        setLastCitations(lastAi.citations || [])
        setLastSourceCount(lastAi.sourceCount || 0)
      } else {
        setLastCitations([])
        setLastSourceCount(0)
      }
    }
  }, [threadQuery.data])

  // Clear messages when navigating to new chat (no threadId)
  useEffect(() => {
    if (!threadId) {
      setMessages([])
      setLastCitations([])
      setLastSourceCount(0)
    }
  }, [threadId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const askLawyer = trpc.rag.askLawyer.useMutation({
    onSuccess: data => {
      if ('answer' in data && data.answer) {
        setMessages(prev => [
          ...prev,
          {
            type: 'ai',
            content: data.answer,
            citations: data.citations,
            sourceCount: data.sourceCount,
          },
        ])
        setLastCitations(data.citations || [])
        setLastSourceCount(data.sourceCount || 0)
        incrementQuota()
        toast.success('Answer generated!')

        // Navigate to the new thread if one was created
        if (!threadId && data.threadId) {
          navigate(`/ask-lawyer/${data.threadId}`, { replace: true })
        }

        // Refresh sidebar thread list
        trpcUtils.chatHistory.listThreads.invalidate()
      }
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !user) return

    if (quota.used >= quota.limit) {
      toast.error('Daily AI credits exhausted')
      return
    }

    setMessages(prev => [...prev, { type: 'user', content: question }])
    askLawyer.mutate({
      query: question,
      userId: user.uid,
      threadId: threadId,
    })
    setQuestion('')
  }

  const handleNewChat = () => {
    navigate('/ask-lawyer')
    setMessages([])
    setLastCitations([])
    setLastSourceCount(0)
  }

  const handleSelectThread = (selectedThreadId: string) => {
    navigate(`/ask-lawyer/${selectedThreadId}`)
  }

  return (
    <div className="flex h-full -mx-8 -my-8 bg-slate-50 dark:bg-slate-950">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeThreadId={threadId || null}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Header with Quota */}
        <div className="sticky top-0 z-10 px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-blue-700 dark:text-blue-500" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ask the Lawyer</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Daily Credits
                </div>
                <div className={`text-lg font-bold ${quota.used >= quota.limit ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-500'}`}>
                  {quota.limit - quota.used}/{quota.limit}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area with max-width constraint */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Disclaimer */}
            <div className="rounded-sm border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Disclaimer:</strong> Maneho.ai provides AI-generated guidance based on official LTO documents. Always verify with actual traffic enforcers or official LTO branches for formal legal disputes.
              </p>
            </div>

            {/* Chat Messages */}
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Scale className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                      Start a conversation by asking a question about LTO regulations
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-sm px-5 py-4 text-sm ${
                        msg.type === 'user'
                          ? 'bg-blue-700 text-white border border-blue-700 dark:border-blue-600'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {msg.type === 'ai' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}

                      {/* Inline Citations for AI Messages */}
                      {msg.type === 'ai' && msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1 uppercase tracking-wide">
                            <FileText size={12} />
                            Sources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((cite, citIdx) => (
                              <span
                                key={citIdx}
                                className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              >
                                {cite.documentId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {askLawyer.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-sm">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-700 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-700 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Sticky Input Area */}
        <div className="sticky bottom-0 px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask about traffic violations, fines, LTO rules..."
                  disabled={quota.used >= quota.limit}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 text-sm transition-colors disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={askLawyer.isPending || quota.used >= quota.limit || !question.trim()}
                  className="rounded-sm shadow-none gap-2 px-6 bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 text-white border-0"
                >
                  <Send size={16} />
                  Ask
                </Button>
              </div>
              {quota.used >= quota.limit && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Daily AI credits exhausted. Resets at midnight.
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Maneho.ai can make mistakes. Always verify with official LTO documentation or a legal professional.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
