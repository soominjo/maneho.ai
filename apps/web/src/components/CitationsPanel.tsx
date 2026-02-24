import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { formatDocTitle } from '../utils/formatDocTitle'

interface Citation {
  documentId: string
  chunkText: string
}

interface CitationsPanelProps {
  citations: Citation[]
  sourceCount: number
  isLoading?: boolean
  selectedSourceIdx?: number | null
  onSourceSelect?: (idx: number) => void
}

/**
 * CitationsPanel displays RAG sources and citations from the AI response
 * Responsive: hidden on mobile (hidden md:block), visible on desktop
 */
export function CitationsPanel({
  citations,
  sourceCount,
  isLoading,
  selectedSourceIdx,
  onSourceSelect,
}: CitationsPanelProps) {
  const hasCitations = citations.length > 0
  const displayText = sourceCount === 1 ? 'source' : 'sources'

  return (
    <Card className="h-fit sticky top-20 border border-border shadow-none bg-card dark:bg-slate-800 rounded-sm max-h-[calc(100vh-6rem)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-card-foreground">Sources</CardTitle>
          <Badge
            variant="secondary"
            className="bg-accent text-accent-foreground border border-accent shadow-none rounded-sm"
          >
            {sourceCount} {displayText}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          Retrieved from LTO documents
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted dark:bg-slate-700 border border-border rounded-sm animate-pulse" />
            <div className="h-4 bg-muted dark:bg-slate-700 border border-border rounded-sm w-5/6 animate-pulse" />
          </div>
        ) : !hasCitations ? (
          <p className="text-sm text-muted-foreground py-4">
            Sources will appear here when you ask a question.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {citations.map((citation, idx) => (
              <div
                key={`${citation.documentId}-${idx}`}
                onClick={() => onSourceSelect?.(idx)}
                className={`p-3 rounded-sm border transition-colors shadow-none cursor-pointer ${
                  selectedSourceIdx === idx
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary ring-2 ring-primary/20'
                    : 'bg-muted dark:bg-slate-700 border-border hover:bg-muted/80 dark:hover:bg-slate-600 text-muted-foreground'
                }`}
              >
                <p className="text-xs font-semibold text-primary mb-2">Source {idx + 1}</p>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {formatDocTitle(citation.documentId)}
                </p>
                <p className="text-sm text-card-foreground font-medium line-clamp-4">
                  {citation.chunkText}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
