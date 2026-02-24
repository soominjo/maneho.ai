import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UserProfileDropdown } from '../components/UserProfileDropdown'
import { cn } from '@repo/ui/lib/utils'
import { Scale, AlertTriangle, FileCheck, FileText, Menu, X } from 'lucide-react'

// Primary navigation links
const navigationItems = [
  { label: 'Ask Lawyer', path: '/ask-lawyer', icon: Scale },
  { label: 'Ticket Decoder', path: '/ticket-decoder', icon: FileCheck },
  { label: 'Crisis Manager', path: '/crisis-manager', icon: AlertTriangle },
  { label: 'Script Generator', path: '/script-generator', icon: FileText },
]

export function DashboardLayout() {
  const { quota } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Top Navbar - Modern Design */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding (Left) */}
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-14 h-14 rounded-sm flex items-center justify-center flex-shrink-0 aspect-square">
                  <img
                    src="/new-maneho-logo-removebg-preview.png"
                    alt="Maneho Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-slate-900 dark:text-white font-bold text-lg leading-tight tracking-tight">
                    Maneho AI
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider hidden sm:block">
                    Legal Assistant
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation (Center) - Hidden on mobile */}
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
                        : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400'
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
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex items-baseline gap-1 shadow-none hidden sm:flex">
                <span className="text-primary dark:text-blue-400 font-bold text-sm">
                  {quota.limit - quota.used}/{quota.limit}
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-xs">credits</span>
              </div>

              {/* Theme Toggle - Hidden (moved to User Profile Dropdown) */}
              {/*
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              */}

              {/* User Profile Dropdown */}
              <UserProfileDropdown />

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-sm text-blue-200 hover:text-white hover:bg-blue-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Quota display */}
              <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>AI Credits Remaining:</span>
                <span className="text-primary dark:text-blue-400 font-bold">
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
                        ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-blue-400'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}

              {/* Mobile Profile Menu - placeholder for profile options */}
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                  Account
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
