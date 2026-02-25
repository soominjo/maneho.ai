import { useNavigate } from 'react-router-dom'
import { Scale, AlertCircle, Ticket, DollarSign, GraduationCap } from 'lucide-react'

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
    <div className="min-h-[calc(100vh-60px)] bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* HERO */}
      <section className="container mx-auto px-6 py-28 text-center">
        {/* Logo */}
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600/10 p-4 rounded-2xl shadow-sm">
            <img
              src="/new-maneho-logo-removebg-preview.png"
              alt="Maneho AI Logo"
              className="w-14 h-14 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Maneho AI</h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Your AI-powered legal assistant for Filipino motorists. Instantly understand LTO
          regulations, violations, and vehicle requirements with confidence.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-base px-8 py-6 rounded-xl shadow-sm hover:shadow-md transition"
            onClick={() => navigate('/register')}
          >
            Get Started Free
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 py-6 rounded-xl"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 pb-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>

          <p className="text-slate-600 dark:text-slate-400">
            Powerful AI tools designed for Philippine motorists
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature Card Template */}

          {/* Lawyer */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader>
              <div className="mb-3 w-fit p-3 rounded-xl bg-blue-600/10">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>

              <CardTitle className="text-xl">LTO Lex</CardTitle>

              <CardDescription>
                AI Bot that answers legal questions grounded in official LTO documents
              </CardDescription>
            </CardHeader>

            <CardContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Get citation-backed legal explanations about violations, regulations, and your rights
              as a motorist.
            </CardContent>
          </Card>

          {/* Crisis */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader>
              <div className="mb-3 w-fit p-3 rounded-xl bg-blue-600/10">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>

              <CardTitle className="text-xl">Crisis Manager</CardTitle>

              <CardDescription>Guidance after accidents</CardDescription>
            </CardHeader>

            <CardContent className="text-sm text-slate-600 dark:text-slate-400">
              Step-by-step instructions and insurance insights to help you respond properly during
              road incidents.
            </CardContent>
          </Card>

          {/* Ticket */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader>
              <div className="mb-3 w-fit p-3 rounded-xl bg-blue-600/10">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>

              <CardTitle className="text-xl">Ticket Decoder</CardTitle>

              <CardDescription>Understand your violations instantly</CardDescription>
            </CardHeader>

            <CardContent className="text-sm text-slate-600 dark:text-slate-400">
              Upload your ticket and get violation explanations, penalties, and legal references.
            </CardContent>
          </Card>

          {/* Cost */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader>
              <div className="mb-3 w-fit p-3 rounded-xl bg-blue-600/10">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>

              <CardTitle className="text-xl">Cost Estimator</CardTitle>

              <CardDescription>Calculate renewal fees</CardDescription>
            </CardHeader>

            <CardContent className="text-sm text-slate-600 dark:text-slate-400">
              Get accurate fee breakdowns including penalties, insurance, and registration costs.
            </CardContent>
          </Card>

          {/* Quiz */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader>
              <div className="mb-3 w-fit p-3 rounded-xl bg-blue-600/10">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>

              <CardTitle className="text-xl">Quiz & Study</CardTitle>

              <CardDescription>Prepare for LTO exams</CardDescription>
            </CardHeader>

            <CardContent className="text-sm text-slate-600 dark:text-slate-400">
              Practice quizzes with AI explanations to help you pass your driving exam.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-32 text-center">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-sm">
          <h2 className="text-3xl font-bold mb-4">Free During Beta</h2>

          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Start using Maneho AI today with free daily access. No credit card required.
          </p>

          <Button
            size="lg"
            className="px-10 py-6 text-base rounded-xl shadow hover:shadow-lg transition"
            onClick={() => navigate('/register')}
          >
            Start Free Today
          </Button>
        </div>
      </section>
    </div>
  )
}
