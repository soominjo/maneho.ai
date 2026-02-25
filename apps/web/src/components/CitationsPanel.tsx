import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { FileText, Download } from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import { ref, getDownloadURL } from 'firebase/storage'
import { getStorageInstance } from '../lib/firebase'
import { formatDocTitle } from '../utils/formatDocTitle'
import { getDocStoragePath } from '../utils/getDocStoragePath'

interface Citation {
  documentId: string
  chunkText: string
}

function CitationCard({
  citation,
  idx,
  isSelected,
  onClick,
}: {
  citation: Citation
  idx: number
  isSelected: boolean
  onClick: () => void
}) {
  const [downloading, setDownloading] = useState(false)
  const title = formatDocTitle(citation.documentId)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloading(true)
    try {
      const storage = getStorageInstance()
      const path = getDocStoragePath(citation.documentId)
      const url = await getDownloadURL(ref(storage, path))
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to get PDF download URL:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-sm border transition-colors cursor-pointer',
        isSelected
          ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
          : 'bg-muted border-border hover:bg-muted/80'
      )}
    >
      {/* Title row with download button */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-start gap-1.5 min-w-0">
          <FileText className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">{title}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          title="Open PDF"
          className="shrink-0 p-1 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Source label */}
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5 pl-5">
        Source {idx + 1}
      </p>

      {/* Excerpt */}
      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed pl-5">
        {citation.chunkText}
      </p>
    </div>
  )
}

interface CitationsPanelProps {
  citations: Citation[]
  sourceCount: number
  isLoading?: boolean
  selectedSourceIdx?: number | null
  onSourceSelect?: (idx: number) => void
}

/**
 * CitationsPanel displays RAG sources and citations from the AI response.
 * Responsive: hidden on mobile (hidden md:block), visible on desktop.
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
    <Card className="h-fit sticky top-20 border border-border shadow-none bg-card rounded-sm max-h-[calc(100vh-6rem)]">
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
            <div className="h-4 bg-muted border border-border rounded-sm animate-pulse" />
            <div className="h-4 bg-muted border border-border rounded-sm w-5/6 animate-pulse" />
          </div>
        ) : !hasCitations ? (
          <p className="text-sm text-muted-foreground py-4">
            Sources will appear here when you ask a question.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {citations.map((citation, idx) => (
              <CitationCard
                key={`${citation.documentId}-${idx}`}
                citation={citation}
                idx={idx}
                isSelected={selectedSourceIdx === idx}
                onClick={() => onSourceSelect?.(idx)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
