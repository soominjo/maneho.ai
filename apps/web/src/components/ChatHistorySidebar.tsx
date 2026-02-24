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
      <div className="fixed left-4 top-[72px] z-40 bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm p-2 transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          title="Open chat history"
          className="hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none"
        >
          <PanelLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-16 z-40 w-72 h-[calc(100vh-4rem)] bg-card dark:bg-slate-900 border-r border-border dark:border-slate-800 flex flex-col overflow-hidden shadow-sm transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="flex-1 justify-start gap-2 bg-primary dark:bg-blue-600 text-white border-none hover:bg-blue-800 dark:hover:bg-blue-700 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none"
        >
          <PanelLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </Button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-white dark:bg-slate-900">
        {threads.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
            No conversations yet
          </p>
        ) : (
          groupOrder.map(group => {
            const items = grouped[group]
            if (!items || items.length === 0) return null

            return (
              <div key={group}>
                <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {items.map(thread => (
                    <div
                      key={thread.id}
                      className={cn(
                        'group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors border',
                        thread.id === activeThreadId
                          ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-blue-400 border-slate-200 dark:border-slate-700'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                      )}
                      onClick={() => {
                        if (editingId !== thread.id) {
                          onSelectThread(thread.id)
                        }
                      }}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />

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
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs dark:text-slate-100 focus:outline-none focus:border-primary dark:focus:border-blue-400 focus:ring-1 focus:ring-primary dark:focus:ring-blue-400 shadow-none"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                          />
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleRename(thread.id)
                            }}
                            className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setEditingId(null)
                            }}
                            className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 truncate text-sm dark:text-slate-100">
                            {thread.title}
                          </span>
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setEditingId(thread.id)
                                setEditTitle(thread.title)
                              }}
                              className="p-1 rounded-sm hover:bg-slate-100"
                              title="Rename"
                            >
                              <Pencil className="w-3 h-3 text-slate-500 hover:text-blue-700" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleDelete(thread.id)
                              }}
                              className="p-1 rounded-sm hover:bg-slate-100"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 text-slate-500 hover:text-red-600" />
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
