import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UserProfileDropdown } from '../components/UserProfileDropdown'
import { Logo } from '../components/Logo'
import { cn } from '@repo/ui/lib/utils'
import { Scale, FileCheck, Menu, X, GraduationCap } from 'lucide-react'

// Primary navigation links
const navigationItems = [
  { label: 'LTO Lex', path: '/ask-lawyer', icon: Scale },
  { label: 'Ticket Decoder', path: '/ticket-decoder', icon: FileCheck },
  { label: 'Quiz & Study', path: '/quiz', icon: GraduationCap },
]

export function DashboardLayout() {
  const { quota } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding (Left) */}
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Logo size="lg" />
                <div>
                  <h1 className="text-card-foreground font-bold text-lg leading-tight tracking-tight">
                    Maneho AI
                  </h1>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider hidden sm:block">
                    Legal Assistant
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation (Center) */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map(item => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'text-sm font-medium transition-colors py-4 px-1 border-b-2 border-transparent flex items-center gap-1.5',
                      isActive
                        ? 'text-primary border-primary'
                        : 'text-muted-foreground hover:text-primary'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right Side Tools */}
            <div className="flex items-center gap-3">
              {/* Quota Badge */}
              <div className="bg-secondary border border-border rounded-lg px-3 py-1.5 items-baseline gap-1 shadow-none hidden sm:flex">
                <span className="text-primary font-bold text-sm">
                  {quota.limit - quota.used}/{quota.limit}
                </span>
                <span className="text-muted-foreground text-xs">credits</span>
              </div>

              {/* User Profile Dropdown */}
              <UserProfileDropdown />

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border shadow-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Quota display */}
              <div className="px-3 py-2 text-sm text-muted-foreground mb-2 border-b border-border flex justify-between">
                <span>AI Credits Remaining:</span>
                <span className="text-primary font-bold">
                  {quota.limit - quota.used}/{quota.limit}
                </span>
              </div>
              {navigationItems.map(item => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}

              {/* Mobile Profile section */}
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2">
                  Account
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
