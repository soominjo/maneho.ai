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
    <div className="flex h-full -mx-8 -my-8">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeThreadId={threadId || null}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              Ask the Lawyer
            </h1>
            <p className="text-muted-foreground mt-2">
              Ask questions about traffic, vehicle, and LTO regulations. Answers are grounded in
              actual LTO documents.
            </p>
          </div>

          {/* Split-View Layout: Chat + Citations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Chat Area - 2 columns on desktop */}
            <div className="md:col-span-2 flex flex-col space-y-4">
              {/* Message History */}
              <Card className="flex-1 flex flex-col min-h-96">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Start a conversation by asking a question...</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[75%] px-4 py-2 rounded-sm border ${
                            msg.type === 'user'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted text-foreground border-border'
                          }`}
                        >
                          {msg.type === 'ai' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {askLawyer.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-4 rounded-sm border border-border">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
              </Card>

              {/* Chat Input Form */}
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="What's your question about LTO regulations?"
                    className="flex-1 px-4 py-2 border border-input rounded-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="submit" disabled={askLawyer.isPending || quota.used >= quota.limit}>
                    Ask
                  </Button>
                </div>
                {quota.used >= quota.limit && (
                  <p className="text-sm text-destructive">
                    Daily AI credits exhausted. Resets at midnight.
                  </p>
                )}
              </form>
            </div>

            {/* Citations Sidebar - 1 column, hidden on mobile */}
            <div className="hidden md:flex md:flex-col">
              <CitationsPanel
                citations={lastCitations}
                sourceCount={lastSourceCount}
                isLoading={askLawyer.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
