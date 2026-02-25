import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { LogOut, Moon, Sun, User, Settings } from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'

export function UserProfileDropdown() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
    navigate('/')
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg border border-border',
          'bg-card text-foreground',
          'hover:bg-secondary transition-colors'
        )}
        title="Profile"
      >
        {user?.name ? (
          <span className="text-sm font-semibold">{getInitials()}</span>
        ) : (
          <User className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-56 rounded-lg border border-border',
            'bg-card shadow-sm z-50'
          )}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </p>
            {user?.name && (
              <p className="text-sm font-medium text-foreground mt-1 truncate">{user.name}</p>
            )}
            {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
          </div>

          {/* Menu Items */}
          <div className="px-1 py-2 space-y-1">
            {/* Account Settings */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium',
                'text-foreground hover:bg-secondary transition-colors'
              )}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleDarkMode()
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium',
                'text-foreground hover:bg-secondary transition-colors'
              )}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-border" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium',
                'text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors'
              )}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
