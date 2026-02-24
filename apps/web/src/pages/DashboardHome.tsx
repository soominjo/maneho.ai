import { Link } from 'react-router-dom'
import {
  Scale,
  AlertCircle,
  Ticket,
  FileText,
  DollarSign,
  BookOpen,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { LayoutWrapper } from '../components/LayoutWrapper'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'

const features = [
  { icon: Scale, title: 'Ask Lawyer', desc: 'Legal questions answered', path: '/ask-lawyer' },
  {
    icon: AlertCircle,
    title: 'Crisis Manager',
    desc: 'Post-accident guidance',
    path: '/crisis-manager',
  },
  {
    icon: Ticket,
    title: 'Ticket Decoder',
    desc: 'Extract & understand tickets',
    path: '/ticket-decoder',
  },
  {
    icon: FileText,
    title: 'Script Generator',
    desc: 'Create persuasive scripts',
    path: '/script-generator',
  },
  {
    icon: DollarSign,
    title: 'Cost Estimator',
    desc: 'Calculate renewal costs',
    path: '/cost-estimator',
  },
  {
    icon: BookOpen,
    title: 'License Wizard',
    desc: 'Renewal requirements',
    path: '/license-wizard',
  },
  { icon: GraduationCap, title: 'Quiz & Study', desc: 'LTO exam prep', path: '/quiz' },
]

export function DashboardHome() {
  const { user, quota } = useAuth()

  return (
    <LayoutWrapper maxWidth="wide" className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-muted-foreground mt-2">
          Choose a feature below to get started with AI-powered legal assistance.
        </p>
      </div>

      {/* Quick Stats */}
      <Card className="shadow-none border border-border">
        <CardHeader>
          <CardTitle>Daily AI Credits</CardTitle>
          <CardDescription className="text-muted-foreground">
            You have {quota.limit - quota.used} interactions remaining today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary border border-input rounded-sm h-3 overflow-hidden shadow-none">
            <div
              className="bg-primary h-3 transition-all"
              style={{ width: `${((quota.limit - quota.used) / quota.limit) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Resets at midnight. {quota.used} / {quota.limit} used
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(feature => {
            const IconComponent = feature.icon
            return (
              <Link key={feature.path} to={feature.path}>
                <Card className="h-full border border-border hover:border-primary transition-colors cursor-pointer shadow-none">
                  <CardHeader>
                    <div className="mb-2">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-400 dark:border-yellow-700 shadow-none">
        <CardHeader>
          <CardTitle>💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-yellow-900 dark:text-yellow-100">
          <p>• Each AI interaction (question, ticket decode, estimation) uses 1 credit</p>
          <p>• You have 20 credits per day - use them wisely!</p>
          <p>• All answers are grounded in actual LTO documents and regulations</p>
          <p>• Visit your profile to track your usage history</p>
        </CardContent>
      </Card>
    </LayoutWrapper>
  )
}
