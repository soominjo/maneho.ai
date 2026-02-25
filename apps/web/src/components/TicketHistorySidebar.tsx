import { useState } from 'react'
import { Plus, Ticket, Trash2, PanelLeft, Calendar } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { cn } from '@repo/ui/lib/utils'
import { useTicketHistory } from '../hooks/useTicketHistory'
import { TicketHistory } from '@repo/shared'

function TicketThumbnail({ imageUrl, isActive }: { imageUrl: string; isActive: boolean }) {
  const [imgFailed, setImgFailed] = useState(false)

  if (!imgFailed) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-md overflow-hidden shrink-0 border transition-colors',
          isActive ? 'border-primary/30' : 'border-border'
        )}
      >
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors',
        isActive ? 'bg-primary/15' : 'bg-secondary group-hover:bg-secondary/80'
      )}
    >
      <Ticket className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
    </div>
  )
}

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

  // Toggle button always visible when closed
  if (!isOpen) {
    return (
      <div className="fixed left-4 top-[72px] z-40 bg-card border border-border rounded-lg shadow-sm p-2 transition-all duration-300 ease-in-out">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          title="Open scan history"
          className="hover:bg-secondary shadow-none"
        >
          <PanelLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onToggle} />

      <div className="fixed left-0 top-16 z-40 w-72 h-[calc(100vh-4rem)] bg-card border-r border-border flex flex-col overflow-hidden shadow-sm transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="p-3 border-b border-border bg-card flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewScan}
            className="flex-1 justify-start gap-2 bg-primary text-white border-none hover:bg-primary/90 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Scan
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-2 hover:bg-secondary shadow-none"
          >
            <PanelLeft className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No decodes yet</p>
          ) : (
            groupOrder.map(group => {
              const items = grouped[group]
              if (!items || items.length === 0) return null

              return (
                <div key={group}>
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {group}
                  </div>
                  <div className="space-y-1 mt-1">
                    {items.map(record => (
                      <div
                        key={record.id}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-3 rounded-lg text-sm cursor-pointer transition-all border outline-none',
                          record.id === activeTicketId
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'hover:bg-secondary text-foreground border-transparent'
                        )}
                        onClick={() => onSelectTicket(record)}
                      >
                        <TicketThumbnail
                          imageUrl={record.imageUrl}
                          isActive={record.id === activeTicketId}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-[13px]">
                            {(record.violationType || 'Unknown Violation')
                              .replace(/\*+/g, '')
                              .trim()}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground uppercase tracking-tight font-medium">
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
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
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
    </>
  )
}
