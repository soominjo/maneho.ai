import { useNavigate } from 'react-router-dom'
import { Car, Scale, AlertCircle, Ticket, DollarSign, BookOpen, GraduationCap } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <Car className="w-12 h-12 text-blue-700" />
          Maneho AI
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Your AI-powered Filipino traffic and vehicle legal assistant. Get instant answers about
          LTO regulations, vehicle registration, and traffic violations.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/register')}>
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Overview */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-none border border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-700" />
                The Lawyer
              </CardTitle>
              <CardDescription className="text-slate-600">
                Ask legal questions about traffic and vehicle regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Get RAG-grounded answers with citations to actual LTO documents and regulations.
                Perfect for understanding your rights and obligations on Philippine roads.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-700" />
                Crisis Manager
              </CardTitle>
              <CardDescription className="text-slate-600">
                Post-accident guidance and insurance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Step-by-step checklists for handling accidents and detailed insurance policy
                analysis to understand your coverage options.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Ticket className="w-6 h-6 text-blue-700" />
                Ticket Decoder
              </CardTitle>
              <CardDescription className="text-slate-600">
                Extract and understand traffic tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Upload a photo of your traffic ticket, get the text extracted via AI, and instantly
                find out the fine amount from LTO fee tables.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-700" />
                Cost Estimator
              </CardTitle>
              <CardDescription className="text-slate-600">
                Calculate vehicle registration renewal costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Enter your vehicle details and months overdue to get an accurate breakdown of all
                fees including penalties, emission tests, and insurance.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-700" />
                License Wizard
              </CardTitle>
              <CardDescription className="text-slate-600">
                Personalized driver's license requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Get step-by-step checklists and timelines for student permits, non-professional
                licenses, professional licenses, and renewals.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-700" />
                Quiz & Study
              </CardTitle>
              <CardDescription className="text-slate-600">
                Interactive LTO exam preparation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Test your knowledge with LTO-based quizzes and get AI-powered explanations for every
                answer. Built-in study mode with AI tutoring.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Always Free During Beta</h2>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          20 AI-powered interactions per day. No credit card required. Sign up now and start getting
          expert legal guidance instantly.
        </p>
        <Button size="lg" onClick={() => navigate('/register')}>
          Start Free Today
        </Button>
      </section>
    </div>
  )
}
