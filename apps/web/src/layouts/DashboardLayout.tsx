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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Logo Section */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-700 dark:bg-blue-700 rounded-sm flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Maneho<span className="text-blue-700 dark:text-blue-500">.ai</span></h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">LTO Legal Assistant</p>
          </div>

          {/* Quota Indicator - Card Style */}
          <div className="p-4 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-blue-50/50 dark:to-blue-950/10 rounded-sm">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-widest">Daily AI Credits</div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-4">
              {quota.limit - quota.used}/{quota.limit}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-sm h-2 overflow-hidden">
              <div
                className="bg-blue-700 dark:bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((quota.limit - quota.used) / quota.limit) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">Resets at midnight UTC</div>
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
                    <div className="px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-4 mb-2">
                      {item.category}
                    </div>
                  )}
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all border',
                      isActive
                        ? 'bg-blue-700 text-white border-blue-700 dark:border-blue-600 dark:bg-blue-700'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div>{item.label}</div>
                      {item.description && (
                        <div
                          className={cn(
                            'text-xs mt-1',
                            isActive ? 'text-blue-100 dark:text-blue-200' : 'text-slate-500 dark:text-slate-400'
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
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <Button
              onClick={toggleDarkMode}
              className="w-full justify-start gap-2 rounded-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-none font-medium text-sm"
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
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
        <div className="container mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
