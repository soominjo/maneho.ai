import { useState } from 'react'
import { Plus, MessageSquare, Pencil, Trash2, PanelLeft, Check, X } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { cn } from '@repo/ui/lib/utils'
import { IconButton } from './IconButton' // <-- Imported your accessible IconButton

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
      <div className="fixed left-4 top-[72px] z-40 bg-card border border-border rounded-lg shadow-sm p-2 transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Open chat history"
          title="Open chat history"
          className="hover:bg-secondary shadow-none"
        >
          <PanelLeft aria-hidden="true" className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        onClick={onToggle}
        aria-hidden="true"
      />

      <div
        className="fixed left-0 top-16 z-40 w-72 h-[calc(100vh-4rem)] bg-card border-r border-border flex flex-col overflow-hidden shadow-sm transition-all duration-300 ease-in-out"
        role="navigation"
        aria-label="Chat History"
      >
        {/* Header */}
        <div className="p-3 border-b border-border bg-card flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="flex-1 justify-start gap-2 bg-primary text-white border-none hover:bg-primary/90 rounded-lg shadow-sm"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Close chat history"
            title="Close chat history"
            className="ml-2 hover:bg-secondary shadow-none"
          >
            <PanelLeft aria-hidden="true" className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-card">
          {threads.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
          ) : (
            groupOrder.map(group => {
              const items = grouped[group]
              if (!items || items.length === 0) return null

              return (
                <div key={group}>
                  <div
                    className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary rounded-lg"
                    aria-hidden="true"
                  >
                    {group}
                  </div>
                  <div className="space-y-0.5" role="list" aria-label={group}>
                    {items.map(thread => (
                      <div
                        key={thread.id}
                        role="listitem"
                        aria-current={thread.id === activeThreadId ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors border',
                          thread.id === activeThreadId
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'hover:bg-secondary text-foreground border-transparent'
                        )}
                        onClick={() => {
                          if (editingId !== thread.id) {
                            onSelectThread(thread.id)
                          }
                        }}
                      >
                        <MessageSquare
                          aria-hidden="true"
                          className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground"
                        />

                        {editingId === thread.id ? (
                          <div className="flex-1 flex items-center gap-1">
                            <input
                              type="text"
                              value={editTitle}
                              aria-label="Edit conversation title"
                              onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRename(thread.id)
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              className="flex-1 bg-input border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-none"
                              autoFocus
                              onClick={e => e.stopPropagation()}
                            />

                            {/* Replaced with accessible IconButton */}
                            <IconButton
                              label="Confirm rename"
                              icon={
                                <Check className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
                              }
                              onClick={e => {
                                e?.stopPropagation()
                                handleRename(thread.id)
                              }}
                              className="p-0.5"
                            />

                            {/* Replaced with accessible IconButton */}
                            <IconButton
                              label="Cancel rename"
                              icon={
                                <X className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors" />
                              }
                              onClick={e => {
                                e?.stopPropagation()
                                setEditingId(null)
                              }}
                              className="p-0.5"
                            />
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 truncate text-sm text-foreground">
                              {thread.title}
                            </span>
                            <div className="hidden group-hover:flex items-center gap-0.5">
                              {/* Replaced bare <button> with IconButton */}
                              <IconButton
                                label="Rename conversation"
                                icon={
                                  <Pencil className="w-3 h-3 text-muted-foreground hover:text-primary" />
                                }
                                onClick={e => {
                                  e?.stopPropagation()
                                  setEditingId(thread.id)
                                  setEditTitle(thread.title)
                                }}
                                className="p-1 rounded-sm hover:bg-secondary"
                              />

                              {/* Replaced bare <button> with IconButton */}
                              <IconButton
                                label="Delete conversation"
                                icon={
                                  <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                }
                                onClick={e => {
                                  e?.stopPropagation()
                                  handleDelete(thread.id)
                                }}
                                className="p-1 rounded-sm hover:bg-secondary"
                              />
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
    </>
  )
}
