import { Plus, Ticket, Trash2, PanelLeft, Calendar } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { cn } from '@repo/ui/lib/utils'
import { useTicketHistory } from '../hooks/useTicketHistory'
import { TicketHistory } from '@repo/shared'

interface TicketHistorySidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeTicketId: string | null
  onSelectTicket: (ticket: TicketHistory) => void
  onNewScan: () => void
}

function groupTicketsByDate(tickets: TicketHistory[]): Record<string, TicketHistory[]> {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 86400000).toDateString()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)

  const groups: Record<string, TicketHistory[]> = {}

  for (const ticket of tickets) {
    const d = ticket.createdAt instanceof Date ? ticket.createdAt : new Date()
    let group: string
    if (d.toDateString() === today) group = 'Today'
    else if (d.toDateString() === yesterday) group = 'Yesterday'
    else if (d >= weekAgo) group = 'Previous 7 Days'
    else group = 'Older'

    if (!groups[group]) groups[group] = []
    groups[group].push(ticket)
  }

  return groups
}

export function TicketHistorySidebar({
  isOpen,
  onToggle,
  activeTicketId,
  onSelectTicket,
  onNewScan,
}: TicketHistorySidebarProps) {
  const { user } = useAuth()
  const { history, loading, deleteFromHistory } = useTicketHistory(user?.uid)

  const grouped = groupTicketsByDate(history)
  const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Older']

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this ticket scan?')) return
    deleteFromHistory(id)
  }

  // Toggle button always visible
  if (!isOpen) {
    return (
      <div className="fixed left-4 top-[72px] z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-2 transition-all duration-300 ease-in-out">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          title="Open scan history"
          className="hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none"
        >
          <PanelLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className="fixed left-0 top-16 z-40 w-72 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm transition-all duration-300 ease-in-out"
      style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewScan}
          className="flex-1 justify-start gap-2 bg-primary dark:bg-blue-600 text-white border-none hover:bg-blue-800 dark:hover:bg-blue-700 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Scan
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

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-white dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
            No decodes yet
          </p>
        ) : (
          groupOrder.map(group => {
            const items = grouped[group]
            if (!items || items.length === 0) return null

            return (
              <div key={group}>
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {group}
                </div>
                <div className="space-y-1 mt-1">
                  {items.map(record => (
                    <div
                      key={record.id}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-3 rounded-lg text-sm cursor-pointer transition-all border outline-none',
                        record.id === activeTicketId
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 ring-1 ring-blue-100 dark:ring-blue-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-transparent'
                      )}
                      onClick={() => onSelectTicket(record)}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors',
                          record.id === activeTicketId
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        )}
                      >
                        <Ticket
                          className={cn(
                            'w-4 h-4',
                            record.id === activeTicketId
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-slate-500'
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-[13px]">
                          {record.violationType || 'Unknown Violation'}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 uppercase tracking-tight font-medium">
                          <span>#{record.ticketNumber || 'N/A'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {record.createdAt instanceof Date
                              ? record.createdAt.toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={e => handleDelete(e, record.id!)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
