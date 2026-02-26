import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Upload,
  Camera,
  RotateCcw,
  CheckCircle2,
  CoinsIcon,
  ListChecks,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { formatDocTitle } from '../utils/formatDocTitle'
import { getDocStoragePath } from '../utils/getDocStoragePath'
import { TicketHistorySidebar } from '../components/TicketHistorySidebar'
import { LayoutWrapper } from '../components/LayoutWrapper'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getStorageInstance } from '../lib/firebase'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { useTicketHistory } from '../hooks/useTicketHistory'
import { TicketHistory } from '@repo/shared'
import { toast } from 'sonner'

export function CrisisManagerPage() {
  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-2xl">
        <p className="text-muted-foreground mb-8">Post-accident checklist and insurance analysis</p>
        <Card className="shadow-none border border-border">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription className="text-muted-foreground">
              This feature is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The Crisis Manager will provide step-by-step post-accident guidance and insurance
              policy analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface DecodedResult {
  ticketText: string
  explanation: string
  citations: Array<{ documentId: string; chunkText: string }>
  sourceCount: number
}

export function TicketDecoderPage() {
  const { user, quota, incrementQuota } = useAuth()
  const { saveToHistory } = useTicketHistory(user?.uid)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedImageUrlRef = useRef<string | null>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<DecodedResult | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  const handleDownloadSource = async (documentId: string) => {
    setDownloadingIds(prev => new Set([...prev, documentId]))
    try {
      const storage = getStorageInstance()
      const url = await getDownloadURL(ref(storage, getDocStoragePath(documentId)))
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev)
        next.delete(documentId)
        return next
      })
    }
  }

  const decodeTicket = trpc.rag.decodeTicket.useMutation({
    onSuccess: data => {
      if ('explanation' in data && data.explanation) {
        const ticketText = data.ticketText || ''
        const explanation = data.explanation
        const citations = data.citations || []

        setResult({ ticketText, explanation, citations, sourceCount: data.sourceCount || 0 })
        incrementQuota()
        toast.success('Ticket decoded successfully!')

        // Persist to Firestore history
        if (user && uploadedImageUrlRef.current) {
          // Extract first bullet violation as a short label (e.g. "No Helmet")
          const violationMatch = explanation.match(/[-*]\s+([^\n]{3,60})/)
          const violationType = violationMatch ? violationMatch[1].trim() : undefined

          // Extract ticket/TVR number from OCR text (e.g. "TVR No. 1234567")
          const ticketNumberMatch = ticketText.match(
            /(?:TVR|Ticket|Receipt)\s*(?:No\.?|#)\s*([A-Z0-9-]+)/i
          )
          const ticketNumber = ticketNumberMatch ? ticketNumberMatch[1] : undefined

          saveToHistory({
            userId: user.uid,
            imageUrl: uploadedImageUrlRef.current,
            ticketText,
            explanation,
            citations,
            violationType,
            ticketNumber,
          }).catch(err => console.error('Failed to save ticket history:', err))
        }
      } else if ('error' in data) {
        toast.error(data.error || 'Decoding failed')
      }
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be under 10MB')
      return
    }

    if (!user) {
      toast.error('Please sign in to use the Ticket Decoder')
      return
    }

    if (quota.used >= quota.limit) {
      toast.error('Daily AI credits exhausted. Resets at midnight.')
      return
    }

    // Show instant local preview
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setResult(null)

    try {
      // Upload to Firebase Storage
      const storage = getStorageInstance()
      const filePath = `tickets/${user.uid}/${Date.now()}_${file.name}`
      const storageRef = ref(storage, filePath)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(snapshot.ref)
      uploadedImageUrlRef.current = downloadUrl

      // Send only the URL to backend
      decodeTicket.mutate({ imageUrl: downloadUrl })
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`)
    }
  }

  const handleReset = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSelectHistoryItem = (ticket: TicketHistory) => {
    setImagePreview(ticket.imageUrl)
    setResult({
      ticketText: ticket.ticketText,
      explanation: ticket.explanation,
      citations: ticket.citations,
      sourceCount: ticket.citations.length,
    })
    setActiveTicketId(ticket.id!)
  }

  const handleNewScan = () => {
    handleReset()
    setActiveTicketId(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Ticket History Sidebar */}
      <TicketHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTicketId={activeTicketId}
        onSelectTicket={handleSelectHistoryItem}
        onNewScan={handleNewScan}
      />
      {/* Main Content Area - Smooth Transition */}
      <div
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out overflow-auto',
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
        )}
      >
        <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Upload Card */}
            <Card className="shadow-none border border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upload Ticket Image</CardTitle>
                  {imagePreview && (
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Decode Another
                    </Button>
                  )}
                </div>
                <CardDescription className="text-muted-foreground">
                  Take a photo or upload an image of your traffic ticket (TVR)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!imagePreview ? (
                  /* Drop zone / upload area */
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-input rounded-sm p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex gap-2">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Tap to take a photo or upload an image
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG, or WebP up to 10MB
                        </p>
                      </div>
                    </div>
                  </button>
                ) : (
                  /* Image preview */
                  <div className="space-y-3">
                    <div className="relative rounded-sm overflow-hidden border border-border">
                      <img
                        src={imagePreview}
                        alt="Ticket preview"
                        className="w-full max-h-64 object-contain bg-secondary"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loading State */}
            {decodeTicket.isPending && (
              <Card className="shadow-none border border-border">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                    <p className="text-muted-foreground">
                      Scanning ticket and searching LTO records...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {result && (
              <Card className="shadow-none border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Analysis</CardTitle>
                    <Badge variant="secondary">
                      {result.sourceCount} {result.sourceCount === 1 ? 'source' : 'sources'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Source chips — above analysis */}
                  {result.citations.length > 0 && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {result.citations.length}{' '}
                        {result.citations.length === 1 ? 'Source' : 'Sources'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.citations.map((citation, idx) => {
                          const id = citation.documentId
                          const isLoading = downloadingIds.has(id)
                          return (
                            <button
                              key={`${id}-${idx}`}
                              onClick={() => handleDownloadSource(id)}
                              disabled={isLoading}
                              title="Open PDF"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted border border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-xs text-foreground transition-colors disabled:opacity-60 max-w-[220px]"
                            >
                              <FileText className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{formatDocTitle(id)}</span>
                              {isLoading ? (
                                <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin shrink-0" />
                              ) : (
                                <Download className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* AI Explanation */}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <style>{`
                        .section-h2 { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.5rem; }
                        .section-h2 ~ .section-h2 { border-top: 1px solid hsl(var(--border)); margin-top: 1.25rem; padding-top: 1rem; }
                        .section-h2 + ul, .section-h2 + ol { margin-top: 0.25rem !important; }
                      `}</style>
                    <ReactMarkdown
                      components={{
                        h2: ({ ...props }) => {
                          const text = String((props.children as React.ReactNode[])?.[0] || '')
                          let icon = null
                          if (text.includes('Violation')) {
                            icon = <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          } else if (text.includes('Fine') || text.includes('Computed')) {
                            icon = <CoinsIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                          } else if (text.includes('Next') || text.includes('Step')) {
                            icon = <ListChecks className="w-4 h-4 text-amber-600 shrink-0" />
                          }
                          return (
                            <h2 className="section-h2" {...props}>
                              {icon}
                              {props.children}
                            </h2>
                          )
                        },
                        ul: ({ ...props }) => <ul className="my-1.5 pl-5 space-y-1" {...props} />,
                        li: ({ ...props }) => <li className="text-sm text-foreground" {...props} />,
                        strong: ({ ...props }) => (
                          <strong className="font-semibold text-foreground" {...props} />
                        ),
                        code: ({ className, ...props }) =>
                          !className ? (
                            <code
                              className="bg-secondary px-1.5 py-0.5 rounded-sm text-sm font-mono text-foreground"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-secondary p-3 rounded-sm text-xs font-mono text-foreground overflow-x-auto"
                              {...props}
                            />
                          ),
                      }}
                    >
                      {result.explanation}
                    </ReactMarkdown>
                  </div>

                  {/* AI Disclaimer */}
                  <div className="border-t border-border pt-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      This is an AI-generated analysis. Always verify fines and violations with your
                      traffic enforcer or the official LTO branch before taking action.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quota warning */}
            {quota.used >= quota.limit && (
              <p className="text-sm text-red-600">
                Daily AI credits exhausted. Resets at midnight.
              </p>
            )}
          </div>
        </LayoutWrapper>{' '}
        {/* Close main content area */}
      </div>{' '}
      {/* Close flex container */}
    </div>
  )
}

export function ScriptGeneratorPage() {
  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-2xl">
        <p className="text-muted-foreground mb-8">Create persuasive traffic situation scripts</p>
        <Card className="shadow-none border border-border">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription className="text-muted-foreground">
              This feature is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The Script Generator will create respectful conversation scripts for traffic
              situations.
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}

export function CostEstimatorPage() {
  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-2xl">
        <p className="text-muted-foreground mb-8">Calculate vehicle registration renewal costs</p>
        <Card className="shadow-none border border-border">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription className="text-muted-foreground">
              This feature is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The Cost Estimator will calculate all fees for vehicle registration renewal.
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}

export function LicenseWizardPage() {
  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-2xl">
        <p className="text-muted-foreground mb-8">Personalized driver's license requirements</p>
        <Card className="shadow-none border border-border">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription className="text-muted-foreground">
              This feature is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The License Wizard will provide step-by-step requirements for driver's licenses.
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
