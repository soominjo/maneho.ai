import { ParsedReference } from '../utils/parseLegalReferences'

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
      className={`
        bg-slate-100 dark:bg-slate-800/50
        border border-slate-200 dark:border-slate-700
        p-3 rounded-lg
        flex items-center gap-3
        w-fit
        cursor-pointer
        hover:bg-slate-200 dark:hover:bg-slate-700
        hover:border-slate-300 dark:hover:border-slate-600
        transition-all duration-200
        ${className}
      `}
      title={`Click to view: ${reference.title}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <IconComponent size={20} className="text-primary dark:text-blue-400" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0">
        {/* Type Label */}
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {reference.type === 'AdminOrder' && 'Admin Order'}
          {reference.type === 'RA' && 'Law'}
          {reference.type === 'Memo' && 'Memorandum'}
          {reference.type === 'Circular' && 'Circular'}
          {reference.type === 'Resolution' && 'Resolution'}
          {reference.type === 'Unknown' && 'Reference'}
        </span>

        {/* Title */}
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {reference.title}
        </span>
      </div>
    </div>
  )
}
