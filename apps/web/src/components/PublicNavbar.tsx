import { Link } from 'react-router-dom'
import { Logo } from './Logo'

/**
 * PublicNavbar - Simple navbar for public pages (landing, login, register)
 * LTO Flat Design: Philippine Blue (#0038A8), sharp corners, no shadows
 */
export function PublicNavbar() {
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
        </div>
      </div>
    </nav>
  )
}
