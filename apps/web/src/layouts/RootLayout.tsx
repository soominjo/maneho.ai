import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '../components/PublicNavbar'
import { useAuth } from '../hooks/useAuth'

/**
 * RootLayout - Clean wrapper that renders public navbar for unauthenticated users
 * Protected routes (with DashboardLayout) have their own unified navbar
 */
export function RootLayout() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Public Navbar - Only shown to unauthenticated users */}
      {!user && <PublicNavbar />}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer - Only shown on public pages */}
      {!user && (
        <footer className="border-t border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 py-8 shadow-none">
          <div className="container mx-auto px-4 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>© 2026 Maneho AI - Filipino Traffic & Vehicle Legal Assistant</p>
          </div>
        </footer>
      )}
    </div>
  )
}
