import { useState } from 'react'
import { Plus, MessageSquare, Pencil, Trash2, PanelLeft, Check, X } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { cn } from '@repo/ui/lib/utils'

interface ChatHistorySidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeThreadId: string | null
  onSelectThread: (threadId: string) => void
  onNewChat: () => void
}

interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

function groupThreadsByDate(threads: Thread[]): Record<string, Thread[]> {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 86400000).toDateString()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)

  const groups: Record<string, Thread[]> = {}

  for (const thread of threads) {
    const d = new Date(thread.updatedAt)
    let group: string
    if (d.toDateString() === today) group = 'Today'
    else if (d.toDateString() === yesterday) group = 'Yesterday'
    else if (d >= weekAgo) group = 'Previous 7 Days'
    else group = 'Older'

    if (!groups[group]) groups[group] = []
    groups[group].push(thread)
  }

  return groups
}

export function ChatHistorySidebar({
  isOpen,
  onToggle,
  activeThreadId,
  onSelectThread,
  onNewChat,
}: ChatHistorySidebarProps) {
  const { user } = useAuth()
  const trpcUtils = trpc.useUtils()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const threadsQuery = trpc.chatHistory.listThreads.useQuery(
    { userId: user?.uid || '' },
    { enabled: !!user }
  )

  const renameMutation = trpc.chatHistory.renameThread.useMutation({
    onSuccess: () => {
      trpcUtils.chatHistory.listThreads.invalidate()
      setEditingId(null)
    },
  })

  const deleteMutation = trpc.chatHistory.deleteThread.useMutation({
    onSuccess: () => {
      trpcUtils.chatHistory.listThreads.invalidate()
      if (activeThreadId) {
        onNewChat()
      }
    },
  })

  const handleRename = (threadId: string) => {
    if (!user || !editTitle.trim()) return
    renameMutation.mutate({
      userId: user.uid,
      threadId,
      title: editTitle.trim(),
    })
  }

  const handleDelete = (threadId: string) => {
    if (!user) return
    if (!confirm('Delete this conversation?')) return
    deleteMutation.mutate({ userId: user.uid, threadId })
  }

  const threads = threadsQuery.data?.threads || []
  const grouped = groupThreadsByDate(threads)
  const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Older']

  // Toggle button always visible
  if (!isOpen) {
    return (
      <div className="flex-shrink-0 border-r border-border bg-card p-2">
        <Button variant="ghost" size="icon" onClick={onToggle} title="Open chat history">
          <PanelLeft className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-64 border-r border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="flex-1 justify-start gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-2">
          <PanelLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {threads.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
        ) : (
          groupOrder.map(group => {
            const items = grouped[group]
            if (!items || items.length === 0) return null

            return (
              <div key={group}>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {items.map(thread => (
                    <div
                      key={thread.id}
                      className={cn(
                        'group flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer transition-colors',
                        thread.id === activeThreadId
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-foreground'
                      )}
                      onClick={() => {
                        if (editingId !== thread.id) {
                          onSelectThread(thread.id)
                        }
                      }}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />

                      {editingId === thread.id ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRename(thread.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="flex-1 bg-background border border-input rounded-sm px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                          />
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleRename(thread.id)
                            }}
                            className="p-0.5 hover:text-primary"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setEditingId(null)
                            }}
                            className="p-0.5 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 truncate text-xs">{thread.title}</span>
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setEditingId(thread.id)
                                setEditTitle(thread.title)
                              }}
                              className="p-0.5 rounded hover:bg-background"
                              title="Rename"
                            >
                              <Pencil className="w-3 h-3 opacity-50 hover:opacity-100" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleDelete(thread.id)
                              }}
                              className="p-0.5 rounded hover:bg-background"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 opacity-50 hover:opacity-100 hover:text-destructive" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
