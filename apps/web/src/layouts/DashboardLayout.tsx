import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { cn } from '@repo/ui/lib/utils'
import {
  Home,
  Scale,
  AlertTriangle,
  FileCheck,
  FileText,
  DollarSign,
  BookOpen,
  ClipboardList,
  User,
  Moon,
  Sun,
} from 'lucide-react'
import { Button } from '@repo/ui/Button'

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home, category: null },
  {
    label: 'Ask Lawyer',
    path: '/ask-lawyer',
    icon: Scale,
    category: 'RAG Features',
    description: 'Legal AI Assistant',
  },
  {
    label: 'Crisis Manager',
    path: '/crisis-manager',
    icon: AlertTriangle,
    category: null,
    description: 'Emergency Guidance',
  },
  {
    label: 'Ticket Decoder',
    path: '/ticket-decoder',
    icon: FileCheck,
    category: 'Killer Features',
    description: 'Decode Citations',
  },
  {
    label: 'Script Generator',
    path: '/script-generator',
    icon: FileText,
    category: null,
    description: 'Response Templates',
  },
  {
    label: 'Cost Estimator',
    path: '/cost-estimator',
    icon: DollarSign,
    category: null,
    description: 'Fee Calculator',
  },
  {
    label: 'License Wizard',
    path: '/license-wizard',
    icon: BookOpen,
    category: 'Education',
    description: 'Learning Paths',
  },
  {
    label: 'Quiz & Study',
    path: '/quiz',
    icon: ClipboardList,
    category: null,
    description: 'Test Preparation',
  },
  { label: 'Profile', path: '/profile', icon: User, category: 'Settings', description: 'Settings' },
]

export function DashboardLayout() {
  const { quota } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const location = useLocation()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Logo */}
          <div className="border-b border-border pb-6">
            <h2 className="text-lg font-bold text-primary mb-1">Maneho.ai</h2>
            <p className="text-xs text-muted-foreground">LTO Legal Assistant</p>
          </div>

          {/* Quota Indicator */}
          <div className="p-4 border border-border bg-primary/5 rounded-sm">
            <div className="text-xs font-semibold text-muted-foreground mb-3">Daily AI Credits</div>
            <div className="text-3xl font-bold text-primary mb-3">
              {quota.limit - quota.used}/{quota.limit}
            </div>
            <div className="w-full bg-border rounded-sm h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${((quota.limit - quota.used) / quota.limit) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-3">Resets at midnight</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigationItems.map((item, idx) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')

              return (
                <div key={idx}>
                  {item.category && (
                    <div className="px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                      {item.category}
                    </div>
                  )}
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all border border-transparent',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'text-foreground hover:bg-muted border-border hover:border-border'
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div>{item.label}</div>
                      {item.description && (
                        <div
                          className={cn(
                            'text-xs mt-0.5',
                            isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="border-t border-border pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="w-full justify-start gap-2 border border-border rounded-sm"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
