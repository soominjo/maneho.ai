import { createContext, ReactNode, useEffect, useState } from 'react'

export interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ThemeProviderProps {
  children: ReactNode
  defaultDarkMode?: boolean
}

/**
 * Theme Provider Component
 * Manages dark/light mode state and persists preference to localStorage
 */
export function ThemeProvider({ children, defaultDarkMode = false }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme-preference')
    if (stored) {
      return stored === 'dark'
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true
    }

    return defaultDarkMode
  })

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const value: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
