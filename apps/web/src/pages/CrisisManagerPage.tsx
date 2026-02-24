import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  AlertCircle,
  Ticket,
  FileText,
  DollarSign,
  BookOpen,
  GraduationCap,
  User,
  Upload,
  Camera,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  CoinsIcon,
  ListChecks,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { CitationsPanel } from '../components/CitationsPanel'
import { TicketHistorySidebar } from '../components/TicketHistorySidebar'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getStorageInstance } from '../lib/firebase'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { useTicketHistory } from '../hooks/useTicketHistory'
import { TicketHistory } from '@repo/shared'
import { toast } from 'sonner'

export function CrisisManagerPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <AlertCircle className="w-8 h-8 text-blue-700" />
        Crisis Manager
      </h1>
      <p className="text-slate-600 mb-8">Post-accident checklist and insurance analysis</p>
      <Card className="shadow-none border border-slate-200">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription className="text-slate-600">
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The Crisis Manager will provide step-by-step post-accident guidance and insurance policy
            analysis.
          </p>
        </CardContent>
      </Card>
    </div>
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
  useTicketHistory(user?.uid)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<DecodedResult | null>(null)
  const [showRawText, setShowRawText] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)

  const decodeTicket = trpc.rag.decodeTicket.useMutation({
    onSuccess: data => {
      if ('explanation' in data && data.explanation) {
        setResult({
          ticketText: data.ticketText || '',
          explanation: data.explanation,
          citations: data.citations || [],
          sourceCount: data.sourceCount || 0,
        })
        incrementQuota()
        toast.success('Ticket decoded successfully!')
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
    setShowRawText(false)
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
    setShowRawText(false)
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
        className="flex-1 transition-all duration-300 ease-in-out overflow-auto"
        style={{
          marginLeft: sidebarOpen
            ? typeof window !== 'undefined' && window.innerWidth >= 1024
              ? '288px'
              : '0'
            : '0',
        }}
      >
        {/* Page Header */}
        <div className="mb-8 p-4 sm:p-6 lg:p-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="w-8 h-8 text-blue-700" />
            Ticket Decoder
          </h1>
          <p className="text-slate-600 mt-2">
            Upload a photo of your traffic ticket to identify the violation and look up the exact
            fine from LTO regulations.
          </p>
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Area */}
            <div className="md:col-span-2 space-y-4">
              {/* Upload Card */}
              <Card className="shadow-none border border-slate-200">
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
                  <CardDescription className="text-slate-600">
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
                      className="w-full border-2 border-dashed border-slate-300 rounded-sm p-8 text-center hover:border-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-2">
                          <Camera className="w-8 h-8 text-slate-500" />
                          <Upload className="w-8 h-8 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            Tap to take a photo or upload an image
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            JPG, PNG, or WebP up to 10MB
                          </p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    /* Image preview */
                    <div className="space-y-3">
                      <div className="relative rounded-sm overflow-hidden border border-slate-300">
                        <img
                          src={imagePreview}
                          alt="Ticket preview"
                          className="w-full max-h-64 object-contain bg-slate-100"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loading State */}
              {decodeTicket.isPending && (
                <Card className="shadow-none border border-slate-200">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 bg-blue-700 rounded-full animate-bounce" />
                        <div
                          className="w-2.5 h-2.5 bg-blue-700 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className="w-2.5 h-2.5 bg-blue-700 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                      </div>
                      <p className="text-slate-600">Scanning ticket and searching LTO records...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results */}
              {result && (
                <Card className="shadow-none border border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Analysis</CardTitle>
                      <Badge variant="secondary">
                        {result.sourceCount} {result.sourceCount === 1 ? 'source' : 'sources'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* AI Explanation (main result) with enhanced styling */}
                    <div className="space-y-0">
                      {/* Violations Section */}
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:flex prose-headings:items-center prose-headings:gap-3 prose-h2:text-lg prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-0 prose-h2:mb-3 prose-ul:my-2 prose-ul:pl-5 prose-li:text-slate-700">
                        <style>{`
                      .violation-section { padding: 1rem 0; border-bottom: 1px solid rgb(226, 232, 240); }
                      .violation-section:last-child { border-bottom: none; }
                      .violation-section h2 { color: rgb(15, 23, 42); margin-top: 0 !important; margin-bottom: 0.75rem !important; }
                      .violation-section h2::before { content: ''; }
                      .violation-section ul { margin: 0.5rem 0 !important; }
                      .violation-section li { margin: 0.25rem 0; color: rgb(71, 85, 105); }
                    `}</style>
                        <ReactMarkdown
                          components={{
                            h2: ({ ...props }) => {
                              const text = String(props.children?.[0] || '')
                              let icon = null
                              let sectionClass = 'violation-section'

                              if (text.includes('Violation')) {
                                icon = (
                                  <CheckCircle2 className="w-5 h-5 text-blue-700 flex-shrink-0" />
                                )
                              } else if (text.includes('Fine') || text.includes('Computed')) {
                                icon = (
                                  <CoinsIcon className="w-5 h-5 text-green-700 flex-shrink-0" />
                                )
                                sectionClass = 'violation-section fines-section'
                              } else if (text.includes('Next') || text.includes('Step')) {
                                icon = (
                                  <ListChecks className="w-5 h-5 text-amber-700 flex-shrink-0" />
                                )
                                sectionClass = 'violation-section nextsteps-section'
                              }

                              return (
                                <div className={sectionClass}>
                                  <h2
                                    className="flex items-center gap-3 text-lg font-bold text-slate-900 m-0 mb-3"
                                    {...props}
                                  >
                                    {icon}
                                    <span>{props.children}</span>
                                  </h2>
                                </div>
                              )
                            },
                            ul: ({ ...props }) => <ul className="my-2 pl-5 space-y-1" {...props} />,
                            li: ({ ...props }) => (
                              <li className="text-slate-700 text-sm" {...props} />
                            ),
                            strong: ({ ...props }) => (
                              <strong className="font-semibold text-slate-900" {...props} />
                            ),
                            code: ({ inline, ...props }) =>
                              inline ? (
                                <code
                                  className="bg-slate-100 px-1.5 py-0.5 rounded-sm text-sm font-mono text-slate-900"
                                  {...props}
                                />
                              ) : (
                                <code
                                  className="block bg-slate-100 p-3 rounded-sm text-xs font-mono text-slate-700 overflow-x-auto"
                                  {...props}
                                />
                              ),
                          }}
                        >
                          {result.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Raw OCR Text (collapsible) */}
                    <div className="border-t border-slate-300 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowRawText(!showRawText)}
                        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {showRawText ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        Raw extracted text
                      </button>
                      {showRawText && (
                        <pre className="mt-2 p-3 bg-slate-100 rounded-sm text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto border border-slate-300">
                          {result.ticketText}
                        </pre>
                      )}
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

            {/* Citations Sidebar */}
            <div className="hidden md:flex md:flex-col">
              <CitationsPanel
                citations={result?.citations || []}
                sourceCount={result?.sourceCount || 0}
                isLoading={decodeTicket.isPending}
              />
            </div>
          </div>{' '}
          {/* Close grid */}
        </div>{' '}
        {/* Close main content area */}
      </div>{' '}
      {/* Close flex container */}
    </div>
  )
}

export function ScriptGeneratorPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <FileText className="w-8 h-8 text-blue-700" />
        Script Generator
      </h1>
      <p className="text-slate-600 mb-8">Create persuasive traffic situation scripts</p>
      <Card className="shadow-none border border-slate-200">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription className="text-slate-600">
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The Script Generator will create respectful conversation scripts for traffic situations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function CostEstimatorPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <DollarSign className="w-8 h-8 text-blue-700" />
        Cost Estimator
      </h1>
      <p className="text-slate-600 mb-8">Calculate vehicle registration renewal costs</p>
      <Card className="shadow-none border border-slate-200">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription className="text-slate-600">
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The Cost Estimator will calculate all fees for vehicle registration renewal.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function LicenseWizardPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <BookOpen className="w-8 h-8 text-blue-700" />
        License Wizard
      </h1>
      <p className="text-slate-600 mb-8">Personalized driver's license requirements</p>
      <Card className="shadow-none border border-slate-200">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription className="text-slate-600">
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The License Wizard will provide step-by-step requirements for driver's licenses.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function QuizPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <GraduationCap className="w-8 h-8 text-blue-700" />
        Quiz & Study
      </h1>
      <p className="text-slate-600 mb-8">Interactive LTO exam preparation</p>
      <Card className="shadow-none border border-slate-200">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription className="text-slate-600">
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The Quiz will provide LTO-based practice questions and AI-powered explanations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfilePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <User className="w-8 h-8 text-blue-700" />
        Profile
      </h1>
      <p className="text-slate-600 mb-8">Manage your account and view usage</p>
      <Card className="shadow-none border border-slate-200">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription className="text-slate-600">
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The Profile section will show your account details and usage history.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
