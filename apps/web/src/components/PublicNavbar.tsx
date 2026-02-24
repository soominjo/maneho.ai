import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@repo/ui/components/ui/button'
import { Logo } from './Logo'

/**
 * PublicNavbar - Simple navbar for public pages (landing, login, register)
 * LTO Flat Design: Philippine Blue (#0038A8), sharp corners, no shadows
 */
export function PublicNavbar() {
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" />
            <div>
              <h1 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
                Maneho AI
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider hidden sm:block">
                LTO Legal Assistant
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#0038A8] dark:hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
            <Button
              onClick={() => navigate('/register')}
              className="bg-[#0038A8] text-white hover:bg-blue-900 border-none rounded-sm shadow-none px-4 py-2"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
