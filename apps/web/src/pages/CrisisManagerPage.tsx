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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getStorageInstance } from '../lib/firebase'
import { trpc } from '../lib/trpc'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

export function CrisisManagerPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <AlertCircle className="w-8 h-8 text-primary" />
        Crisis Manager
      </h1>
      <p className="text-muted-foreground mb-8">Post-accident checklist and insurance analysis</p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<DecodedResult | null>(null)
  const [showRawText, setShowRawText] = useState(false)

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

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ticket className="w-8 h-8 text-primary" />
          Ticket Decoder
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload a photo of your traffic ticket to identify the violation and look up the exact fine
          from LTO regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Area */}
        <div className="md:col-span-2 space-y-4">
          {/* Upload Card */}
          <Card>
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
              <CardDescription>
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
                  className="w-full border-2 border-dashed border-border rounded-sm p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
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
                      className="w-full max-h-64 object-contain bg-muted"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
          {decodeTicket.isPending && (
            <Card>
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
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Analysis</CardTitle>
                  <Badge variant="secondary">
                    {result.sourceCount} {result.sourceCount === 1 ? 'source' : 'sources'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Explanation (main result) */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.explanation}</ReactMarkdown>
                </div>

                {/* Raw OCR Text (collapsible) */}
                <div className="border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showRawText ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    Raw extracted text
                  </button>
                  {showRawText && (
                    <pre className="mt-2 p-3 bg-muted rounded-sm text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto border border-border">
                      {result.ticketText}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quota warning */}
          {quota.used >= quota.limit && (
            <p className="text-sm text-destructive">
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
      </div>
    </div>
  )
}

export function ScriptGeneratorPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <FileText className="w-8 h-8 text-primary" />
        Script Generator
      </h1>
      <p className="text-muted-foreground mb-8">Create persuasive traffic situation scripts</p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
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
        <DollarSign className="w-8 h-8 text-primary" />
        Cost Estimator
      </h1>
      <p className="text-muted-foreground mb-8">Calculate vehicle registration renewal costs</p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
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
        <BookOpen className="w-8 h-8 text-primary" />
        License Wizard
      </h1>
      <p className="text-muted-foreground mb-8">Personalized driver's license requirements</p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
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
        <GraduationCap className="w-8 h-8 text-primary" />
        Quiz & Study
      </h1>
      <p className="text-muted-foreground mb-8">Interactive LTO exam preparation</p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
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
        <User className="w-8 h-8 text-primary" />
        Profile
      </h1>
      <p className="text-muted-foreground mb-8">Manage your account and view usage</p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Profile section will show your account details and usage history.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
