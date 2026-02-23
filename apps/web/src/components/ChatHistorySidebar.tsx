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
      <div className="flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
        <Button variant="ghost" size="icon" onClick={onToggle} title="Open chat history" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
          <PanelLeft className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Header with New Chat Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <Button
          onClick={onNewChat}
          className="flex-1 justify-start gap-2 rounded-sm bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 text-white border-0 shadow-none font-semibold"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle} 
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {threads.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">No conversations yet</p>
        ) : (
          groupOrder.map(group => {
            const items = grouped[group]
            if (!items || items.length === 0) return null

            return (
              <div key={group}>
                <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {group}
                </div>
                <div className="space-y-1">
                  {items.map(thread => (
                    <div
                      key={thread.id}
                      className={cn(
                        'group flex items-center gap-2 px-3 py-2 rounded-sm text-sm cursor-pointer transition-all border',
                        thread.id === activeThreadId
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200'
                          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      )}
                      onClick={() => {
                        if (editingId !== thread.id) {
                          onSelectThread(thread.id)
                        }
                      }}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />

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
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                          />
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleRename(thread.id)
                            }}
                            className="p-1 hover:text-blue-700 dark:hover:text-blue-500 text-slate-500 dark:text-slate-400"
                            title="Confirm"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setEditingId(null)
                            }}
                            className="p-1 hover:text-red-600 dark:hover:text-red-400 text-slate-500 dark:text-slate-400"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 truncate text-xs font-medium">{thread.title}</span>
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setEditingId(thread.id)
                                setEditTitle(thread.title)
                              }}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                              title="Rename"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleDelete(thread.id)
                              }}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
