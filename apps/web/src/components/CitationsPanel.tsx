import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { FileText } from 'lucide-react'

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
 * Flat design with legal document badge styling
 */
export function CitationsPanel({ citations, sourceCount, isLoading }: CitationsPanelProps) {
  const hasCitations = citations.length > 0
  const displayText = sourceCount === 1 ? 'source' : 'sources'

  return (
    <Card className="h-fit sticky top-24 border border-slate-200 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700 dark:text-blue-500" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Sources</CardTitle>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-sm bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-900/60">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
              {sourceCount} {displayText}
            </span>
          </div>
        </div>
        <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          Retrieved from official LTO documents
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse w-5/6" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse w-4/6" />
          </div>
        ) : !hasCitations ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
            Sources will appear here when you ask a question.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {citations.map((citation, idx) => (
              <div
                key={`${citation.documentId}-${idx}`}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
              >
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1 uppercase tracking-wide">
                  <FileText size={11} />
                  {citation.documentId}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
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
