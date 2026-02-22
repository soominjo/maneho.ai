import {
  AlertCircle,
  Ticket,
  FileText,
  DollarSign,
  BookOpen,
  GraduationCap,
  User,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'

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

export function TicketDecoderPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Ticket className="w-8 h-8 text-primary" />
        Ticket Decoder
      </h1>
      <p className="text-muted-foreground mb-8">Extract and understand traffic tickets</p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Ticket Decoder will extract text from ticket images and calculate fines.
          </p>
        </CardContent>
      </Card>
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
