import { useContext } from 'react'
import { ThemeContext, ThemeContextType } from '../contexts/ThemeContext'

/**
 * useTheme Hook
 * Provides access to theme context for dark/light mode
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
