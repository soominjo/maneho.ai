import { ParsedReference } from '../utils/parseLegalReferences'
import { cn } from '@repo/ui/lib/utils'

interface InlineCitationCardProps {
  reference: ParsedReference
  onClick?: () => void
  className?: string
}

/**
 * Inline Citation Card Component
 * Displays legal references extracted from AI responses
 * Shows reference type (RA, Admin Order, etc.) and title
 */
export function InlineCitationCard({
  reference,
  onClick,
  className = '',
}: InlineCitationCardProps) {
  const IconComponent = reference.icon

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-secondary border border-border',
        'p-3 rounded-lg',
        'flex items-center gap-3',
        'w-fit cursor-pointer',
        'hover:bg-secondary/80 hover:border-border',
        'transition-all duration-200',
        className
      )}
      title={`Click to view: ${reference.title}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <IconComponent size={20} className="text-primary" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0">
        {/* Type Label */}
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {reference.type === 'AdminOrder' && 'Admin Order'}
          {reference.type === 'RA' && 'Law'}
          {reference.type === 'Memo' && 'Memorandum'}
          {reference.type === 'Circular' && 'Circular'}
          {reference.type === 'Resolution' && 'Resolution'}
          {reference.type === 'Unknown' && 'Reference'}
        </span>

        {/* Title */}
        <span className="text-sm font-medium text-foreground truncate">{reference.title}</span>
      </div>
    </div>
  )
}
