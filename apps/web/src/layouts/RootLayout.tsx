import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'

export function RootLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-none">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="font-bold text-xl">
              <span className="text-slate-900">Maneho</span>
              <span className="text-blue-700">AI</span>
            </div>
            <Badge
              variant="default"
              className="ml-2 bg-blue-700 text-white border-none shadow-none rounded-sm"
            >
              AI Legal Assistant
            </Badge>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="text-sm text-slate-600">{user.email}</div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 shadow-none">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          <p>© 2026 Maneho AI - Filipino Traffic & Vehicle Legal Assistant</p>
        </div>
      </footer>
    </div>
  )
}
