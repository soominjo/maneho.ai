import { useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, GraduationCap, ChevronRight } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@repo/ui/components/ui/card'
import { LayoutWrapper } from '../components/LayoutWrapper'

export function QuizPage() {
  const navigate = useNavigate()

  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Quiz & Study</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Prepare for your LTO driver&apos;s license exam with official-style questions.
        </p>

        {/* Stat strip */}
        <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-border">
          {[
            { label: 'Total Questions', value: '60' },
            { label: 'Phases', value: '6' },
            { label: 'Questions per Phase', value: '10' },
            { label: 'Passing Score', value: '80%' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Option cards */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          {/* Reviewer card */}
          <Card className="shadow-none border border-border hover:border-primary/40 transition-colors cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-base">Study Reviewer</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                Read through all 6 topic domains before attempting the mock exam. Covers road signs,
                speed limits, right of way, licensing, penalties, and vehicle requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                onClick={() => navigate('/quiz/reviewer')}
              >
                Open Reviewer
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Exam card */}
          <Card className="shadow-none border border-border hover:border-primary/40 transition-colors cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-base">60-Item Mock Exam</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                Take the full LTO-style mock exam. Answer 10 questions per phase, get scored
                instantly, and review explanations for every answer.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full gap-2" onClick={() => navigate('/quiz/exam')}>
                Start Exam
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tip */}
        <p className="mt-8 text-xs text-muted-foreground max-w-lg">
          <span className="font-medium text-foreground">Tip:</span> We recommend reading through the
          Study Reviewer at least once before taking the mock exam.
        </p>
      </div>
    </LayoutWrapper>
  )
}
