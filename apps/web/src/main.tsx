import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    {/* Top-level ErrorBoundary: catches any unhandled render error in the tree */}
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <QueryProvider>
            <RouterProvider router={router} />
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
