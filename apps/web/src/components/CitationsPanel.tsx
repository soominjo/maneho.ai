import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'

interface Citation {
  documentId: string
  chunkText: string
}

interface CitationsPanelProps {
  citations: Citation[]
  sourceCount: number
  isLoading?: boolean
}

/**
 * CitationsPanel displays RAG sources and citations from the AI response
 * Responsive: hidden on mobile (hidden md:block), visible on desktop
 */
export function CitationsPanel({ citations, sourceCount, isLoading }: CitationsPanelProps) {
  const hasCitations = citations.length > 0
  const displayText = sourceCount === 1 ? 'source' : 'sources'

  return (
    <Card className="h-fit sticky top-20 border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sources</CardTitle>
          <Badge variant="secondary" className="bg-slate-100 text-slate-900">
            {sourceCount} {displayText}
          </Badge>
        </div>
        <CardDescription>Retrieved from LTO documents</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6" />
          </div>
        ) : !hasCitations ? (
          <p className="text-sm text-slate-500 py-4">
            Sources will appear here when you ask a question.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {citations.map((citation, idx) => (
              <div
                key={`${citation.documentId}-${idx}`}
                className="p-3 bg-slate-50 rounded-sm border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <p className="text-xs font-semibold text-slate-700 mb-1">{citation.documentId}</p>
                <p className="text-sm text-slate-600 line-clamp-3">{citation.chunkText}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
