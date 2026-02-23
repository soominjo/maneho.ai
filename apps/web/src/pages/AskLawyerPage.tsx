import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Scale, Bot, X } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { ChatHistorySidebar } from '../components/ChatHistorySidebar'
import { CitationsPanel } from '../components/CitationsPanel'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { formatDocTitle } from '../utils/formatDocTitle'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [citationsDrawerOpen, setCitationsDrawerOpen] = useState(false)
  const [selectedSourceIdx, setSelectedSourceIdx] = useState<number | null>(null)

  // Load thread messages when threadId changes
  const threadQuery = trpc.chatHistory.getThread.useQuery(
    { userId: user?.uid || '', threadId: threadId || '' },
    { enabled: !!threadId && !!user }
  )

  // Populate messages from loaded thread
  useEffect(() => {
    if (threadQuery.data) {
      const loaded: ChatMessage[] = threadQuery.data.messages.map(
        (msg: Record<string, unknown>) => {
          if (msg.role === 'ai') {
            return {
              type: 'ai' as const,
              content: msg.content,
              citations: msg.citations,
              sourceCount: msg.sourceCount,
            }
          }
          return { type: 'user' as const, content: msg.content }
        }
      )
      setMessages(loaded)
    }
  }, [threadQuery.data])

  // Clear messages when navigating to new chat (no threadId)
  useEffect(() => {
    if (!threadId) {
      setMessages([])
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
  }

  const handleSelectThread = (selectedThreadId: string) => {
    navigate(`/ask-lawyer/${selectedThreadId}`)
  }

  // Get the most recent AI message for citations panel
  const mostRecentAiMessage = [...messages].reverse().find(msg => msg.type === 'ai')

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chat History Sidebar - With New Chat Button */}
      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeThreadId={threadId || null}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />

      {/* Main Container - Split Screen on Desktop */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Chat (70% on desktop, 100% on mobile) */}
        <div className="flex-1 flex flex-col items-center overflow-hidden">
          <div className="w-full max-w-3xl flex flex-col h-full">
            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-blue-700" />
                  <p className="text-lg font-medium">Ask me anything about LTO regulations</p>
                  <p className="text-sm mt-1">I'm grounded in official LTO documents</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.type === 'user' ? (
                      // USER BUBBLE - Right-aligned, flat gray
                      <div className="flex justify-end">
                        <div className="max-w-[75%] bg-slate-100 border border-slate-200 rounded-sm px-4 py-2.5 shadow-none">
                          <p className="text-slate-900 text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      // AI BUBBLE - Left-aligned, transparent, with bot icon
                      <div className="flex justify-start gap-3">
                        <Bot className="w-5 h-5 text-blue-700 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="bg-transparent border-none">
                            <div className="prose prose-sm prose-slate max-w-none text-slate-900">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          </div>

                          {/* Citations - Inline Legal Tags Below Text */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {msg.citations.map((citation, cidx) => (
                                <button
                                  key={`${citation.documentId}-${cidx}`}
                                  onClick={() => {
                                    setSelectedSourceIdx(cidx)
                                    if (window.innerWidth < 768) {
                                      setCitationsDrawerOpen(true)
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1 border rounded-sm px-2 py-1 text-xs font-medium transition-colors shadow-none cursor-pointer ${
                                    selectedSourceIdx === cidx
                                      ? 'border-blue-500 bg-blue-100 text-blue-800'
                                      : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  }`}
                                  title={formatDocTitle(citation.documentId)}
                                >
                                  <Scale className="w-3 h-3" />
                                  Source {cidx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Loading Indicator */}
              {askLawyer.isPending && (
                <div className="flex justify-start gap-3">
                  <Bot className="w-5 h-5 text-blue-700 mt-1" />
                  <div className="bg-slate-100 border border-slate-200 rounded-sm px-4 py-2.5 shadow-none">
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

            {/* Input Area - Sticky Bottom with Legal Disclaimer */}
            <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-none">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Ask about traffic, vehicle, or LTO regulations..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-none"
                  />
                  <Button
                    type="submit"
                    disabled={askLawyer.isPending || quota.used >= quota.limit}
                    className="bg-blue-700 text-white hover:bg-blue-800 border-none rounded-sm px-6 shadow-none"
                  >
                    Send
                  </Button>
                </div>

                {/* Legal Disclaimer */}
                <p className="text-xs text-slate-500 text-center">
                  AI-generated responses are for informational purposes only and do not constitute
                  legal advice.
                </p>

                {quota.used >= quota.limit && (
                  <p className="text-sm text-red-600 text-center">
                    Daily AI credits exhausted. Resets at midnight.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Citations Panel (30% width, hidden on mobile) */}
        <div className="hidden md:flex md:w-[30%] border-l border-slate-200 bg-slate-50 p-4 overflow-y-auto">
          {mostRecentAiMessage && mostRecentAiMessage.type === 'ai' ? (
            <CitationsPanel
              citations={mostRecentAiMessage.citations || []}
              sourceCount={mostRecentAiMessage.sourceCount || 0}
              isLoading={askLawyer.isPending}
              selectedSourceIdx={selectedSourceIdx}
              onSourceSelect={setSelectedSourceIdx}
            />
          ) : (
            <div className="text-center text-slate-500">
              <p className="text-sm">Citations will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Citations Drawer - Bottom Sheet */}
      {citationsDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setCitationsDrawerOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg max-h-[80vh] overflow-y-auto border-t border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Sources</h2>
              <button
                onClick={() => setCitationsDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-sm transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4">
              {mostRecentAiMessage &&
              mostRecentAiMessage.type === 'ai' &&
              (mostRecentAiMessage.citations?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {mostRecentAiMessage.citations?.map((citation, idx) => (
                    <div
                      key={`${citation.documentId}-${idx}`}
                      className={`p-3 rounded-sm border transition-colors cursor-pointer ${
                        selectedSourceIdx === idx
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                      onClick={() => setSelectedSourceIdx(idx)}
                    >
                      <p className="text-xs font-semibold text-blue-700 mb-2">Source {idx + 1}</p>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-1">
                        {formatDocTitle(citation.documentId)}
                      </p>
                      <p className="text-sm text-slate-900 font-medium line-clamp-4">
                        {citation.chunkText}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No sources available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Citations Toggle Button - Floating Action Button */}
      {mostRecentAiMessage &&
        mostRecentAiMessage.type === 'ai' &&
        (mostRecentAiMessage.citations?.length ?? 0) > 0 && (
          <button
            onClick={() => setCitationsDrawerOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-40 bg-blue-700 text-white rounded-full p-3 shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
            title="View sources"
          >
            <Scale className="w-5 h-5" />
          </button>
        )}
    </div>
  )
}
