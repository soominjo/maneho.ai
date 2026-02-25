import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <QueryProvider>
          <RouterProvider router={router} />
          <Toaster />
        </QueryProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
