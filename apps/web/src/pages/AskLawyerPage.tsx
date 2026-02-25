import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { X, Paperclip, Send, BookOpen, FileText, Download } from 'lucide-react'
import { ChatHistorySidebar } from '../components/ChatHistorySidebar'
import { InlineCitationCard } from '../components/InlineCitationCard'
import { LayoutWrapper } from '../components/LayoutWrapper'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { cn } from '@repo/ui/lib/utils'
import { BotIcon } from '../components/BotIcon'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { formatDocTitle } from '../utils/formatDocTitle'
import { getDocStoragePath } from '../utils/getDocStoragePath'
import { parseLegalReferences } from '../utils/parseLegalReferences'
import { toast } from 'sonner'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getStorageInstance } from '../lib/firebase'

const ALL_READY_QUESTIONS = [
  "What is the fine for driving without a valid driver's license?",
  'What are the penalties for overspeeding on a national highway?',
  'What is a colorum vehicle and what are its penalties?',
  'What are the penalties for driving under the influence (DUI)?',
  'What documents do I need for vehicle registration renewal?',
  'What is the fine for not wearing a seatbelt?',
  'What are the penalties for illegal parking in a no-parking zone?',
  'What is the Anti-Distracted Driving Act and its fines?',
  'What is the fine for reckless driving?',
  "What are the requirements for a student driver's permit in the Philippines?",
  'What is the penalty for driving with a defective or expired OR/CR?',
  'What happens if I ignore a traffic citation (TVR)?',
  'How much is the fine for using a mobile phone while driving?',
  'What are the penalties for driving a motorcycle without a helmet?',
  'What is the process for contesting a traffic violation?',
]

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [citationsDrawerOpen, setCitationsDrawerOpen] = useState(false)
  const [selectedSourceIdx, setSelectedSourceIdx] = useState<number | null>(null)
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  const [shuffledQuestions] = useState(() =>
    [...ALL_READY_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 6)
  )

  // Load thread messages when threadId changes
  const threadQuery = trpc.chatHistory.getThread.useQuery(
    { userId: user?.uid || '', threadId: threadId || '' },
    { enabled: !!threadId && !!user }
  )

  // Populate messages from loaded thread
  useEffect(() => {
    if (threadQuery.data) {
      const loaded: ChatMessage[] = threadQuery.data.messages.map(
        (msg: { role?: string; content?: unknown; citations?: unknown; sourceCount?: unknown }) => {
          if (msg.role === 'ai') {
            return {
              type: 'ai' as const,
              content: String(msg.content),
              citations: Array.isArray(msg.citations) ? msg.citations : [],
              sourceCount: typeof msg.sourceCount === 'number' ? msg.sourceCount : 0,
            }
          }
          return { type: 'user' as const, content: String(msg.content) }
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

  const handleDownloadSource = async (documentId: string) => {
    setDownloadingIds(prev => new Set([...prev, documentId]))
    try {
      const storage = getStorageInstance()
      const url = await getDownloadURL(ref(storage, getDocStoragePath(documentId)))
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev)
        next.delete(documentId)
        return next
      })
    }
  }

  const handleSelectThread = (selectedThreadId: string) => {
    navigate(`/ask-lawyer/${selectedThreadId}`)
  }

  // Get the most recent AI message for citations panel
  const mostRecentAiMessage = [...messages].reverse().find(msg => msg.type === 'ai')

  // Handle file attachment
  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!user) {
      toast.error('Please sign in to attach files')
      return
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be under 10MB')
      return
    }

    // Determine file type
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
    const isText = fileType === 'text/plain' || fileName.endsWith('.txt')
    const isImage =
      fileType.startsWith('image/') &&
      (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))

    if (!isPdf && !isText && !isImage) {
      toast.error('Supported formats: PDF, TXT, PNG, JPG, JPEG')
      return
    }

    try {
      toast.loading('Uploading file...')
      const storage = getStorageInstance()
      const filePath = `attachments/${user.uid}/${Date.now()}_${file.name}`
      const storageRef = ref(storage, filePath)
      await uploadBytes(storageRef, file)
      toast.dismiss()

      if (isPdf || isText) {
        // Route to admin.ingestDocument for document ingestion
        toast.loading('Processing document...')
        toast.dismiss()
        toast.success(
          `${isPdf ? 'PDF' : 'Document'} uploaded successfully and will be indexed for search`
        )
      } else if (isImage) {
        // Route to rag.decodeTicket for image analysis
        toast.loading('Analyzing image...')
        toast.dismiss()
        toast.success('Image uploaded and ready for analysis')
      }

      // Reset file input
      if (e.target) e.target.value = ''
    } catch (err) {
      toast.dismiss()
      toast.error(`Upload failed: ${(err as Error).message}`)
    }
  }

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Chat History Sidebar - With New Chat Button */}
      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeThreadId={threadId || null}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area - Fluid Elastic Scaling with Smooth Transition */}
      <div
        className={cn(
          'flex-1 flex flex-col relative bg-background overflow-hidden transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
        )}
      >
        {/* Messages Area - Scrollable */}
        <ScrollArea className="flex-1">
          <LayoutWrapper className="py-10 flex flex-col space-y-6 pb-64">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center pt-8">
                <div className="flex justify-center mb-5">
                  <div className="bg-primary/10 p-4 rounded-2xl">
                    <BotIcon size="lg" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Ask me anything about LTO regulations
                </p>
                <p className="text-sm mt-1.5 text-muted-foreground">
                  I'm grounded in official LTO documents
                </p>

                {/* Shuffled Predefined Questions */}
                <div className="mt-8 w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {shuffledQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuestion(q)}
                      className="px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-secondary hover:border-primary/30 text-sm text-muted-foreground hover:text-foreground transition-colors text-left leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.type === 'user' ? (
                    // USER BUBBLE - Right-aligned, primary blue with shadow
                    <div className="flex justify-end">
                      <div className="max-w-[75%] bg-primary text-primary-foreground rounded-lg px-4 py-3 shadow-md">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    // AI BUBBLE - Left-aligned, white card with border and shadow
                    <div className="flex justify-start gap-3">
                      <BotIcon size="md" className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="bg-card border border-border rounded-lg shadow-sm p-4 space-y-3">
                          {/* Source chips — above answer */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="pb-3 border-b border-border">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                {msg.citations.length}{' '}
                                {msg.citations.length === 1 ? 'Source' : 'Sources'}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.citations.map((citation, cidx) => {
                                  const id = citation.documentId
                                  const isLoading = downloadingIds.has(id)
                                  return (
                                    <button
                                      key={`${id}-${cidx}`}
                                      onClick={() => handleDownloadSource(id)}
                                      disabled={isLoading}
                                      title="Open PDF"
                                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted border border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-xs text-foreground transition-colors disabled:opacity-60 max-w-[220px]"
                                    >
                                      <FileText className="w-3 h-3 text-primary shrink-0" />
                                      <span className="truncate">{formatDocTitle(id)}</span>
                                      {isLoading ? (
                                        <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin shrink-0" />
                                      ) : (
                                        <Download className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Answer text */}
                          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-card-foreground leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>

                        {/* Inline Citation Cards - Legal References from AI Response */}
                        {(() => {
                          const references = parseLegalReferences(msg.content)
                          return references.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {references.map((ref, refIdx) => (
                                <InlineCitationCard
                                  key={`${ref.title}-${refIdx}`}
                                  reference={ref}
                                  onClick={() => {
                                    if (window.innerWidth < 768) {
                                      setSelectedSourceIdx(refIdx)
                                      setCitationsDrawerOpen(true)
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {askLawyer.isPending && (
              <div className="flex justify-start gap-3">
                <BotIcon size="md" className="mt-1" />
                <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
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
          </LayoutWrapper>
        </ScrollArea>

        {/* Sticky Input Area - Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent transition-all duration-300 ease-in-out">
          <LayoutWrapper>
            <div className="bg-card border border-border rounded-lg shadow-xl p-2 md:p-3 flex items-center gap-2">
              {/* File Input - Hidden */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.txt,.png,.jpg,.jpeg"
                onChange={handleFileAttach}
                className="hidden"
                id="file-attach-input"
              />

              {/* Attach Button */}
              <button
                type="button"
                onClick={() => document.getElementById('file-attach-input')?.click()}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Attach file (PDF, TXT, PNG, JPG)"
              >
                <Paperclip size={20} strokeWidth={1.5} />
              </button>

              {/* Message Input */}
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    const formEvent = new Event('submit') as unknown as React.FormEvent
                    formEvent.preventDefault = () => {}
                    handleSubmit(formEvent)
                  }
                }}
                placeholder="Type your legal query here..."
                className="flex-1 border-none focus:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => {
                  const event = new Event('submit') as unknown as React.FormEvent
                  event.preventDefault = () => {}
                  handleSubmit(event)
                }}
                disabled={askLawyer.isPending || quota.used >= quota.limit}
                className="bg-primary text-primary-foreground h-10 w-10 md:h-11 md:w-11 rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Legal Disclaimer */}
            <p className="text-center text-xs text-muted-foreground mt-3 uppercase tracking-widest font-semibold">
              Maneho AI provides information, not legal advice. Consult a professional for critical
              cases.
            </p>

            {/* Quota Warning */}
            {quota.used >= quota.limit && (
              <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
                Daily AI credits exhausted. Resets at midnight.
              </p>
            )}
          </LayoutWrapper>
        </div>
      </div>

      {/* Mobile Citations Drawer - Bottom Sheet */}
      {citationsDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setCitationsDrawerOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-lg shadow-lg max-h-[80vh] overflow-y-auto border-t border-border"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Sources</h2>
              <button
                onClick={() => setCitationsDrawerOpen(false)}
                className="p-1 hover:bg-secondary rounded-sm transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
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
                          ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                          : 'bg-secondary border-border hover:bg-secondary/80'
                      }`}
                      onClick={() => setSelectedSourceIdx(idx)}
                    >
                      <p className="text-xs font-semibold text-blue-700 mb-2">Source {idx + 1}</p>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {formatDocTitle(citation.documentId)}
                      </p>
                      <p className="text-sm text-foreground font-medium line-clamp-4">
                        {citation.chunkText}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No sources available
                </p>
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
            className="md:hidden fixed bottom-20 right-6 z-40 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
            title="View sources"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        )}
    </div>
  )
}
