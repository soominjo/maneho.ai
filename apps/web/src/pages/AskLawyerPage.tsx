import { useState } from 'react'
import { Scale } from 'lucide-react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { CitationsPanel } from '../components/CitationsPanel'
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
  const { incrementQuota, quota } = useAuth()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [lastCitations, setLastCitations] = useState<Citation[]>([])
  const [lastSourceCount, setLastSourceCount] = useState(0)

  const askLawyer = trpc.rag.askLawyer.useMutation({
    onSuccess: data => {
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: data.answer,
          citations: data.citations,
          sourceCount: data.sourceCount,
        },
      ])
      setLastCitations(data.citations)
      setLastSourceCount(data.sourceCount)
      incrementQuota()
      toast.success('Answer generated!')
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    if (quota.used >= quota.limit) {
      toast.error('Daily AI credits exhausted')
      return
    }

    setMessages(prev => [...prev, { type: 'user', content: question }])
    askLawyer.mutate({ query: question })
    setQuestion('')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Scale className="w-8 h-8 text-primary" />
          Ask the Lawyer
        </h1>
        <p className="text-muted-foreground mt-2">
          Ask questions about traffic, vehicle, and LTO regulations. Answers are grounded in actual
          LTO documents.
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
                      className={`max-w-xs px-4 py-2 rounded-sm border ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-foreground border-border'
                      }`}
                    >
                      {msg.content}
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
  )
}
