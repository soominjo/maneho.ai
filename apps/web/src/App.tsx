import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { useTheme } from './hooks/useTheme'
import './style.css'

// UI Components
import { Navbar } from '@repo/ui/Navbar'
import { Button } from '@repo/ui/Button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@repo/ui/Card'

// Icons from lucide-react (no emojis!)
import { Scale, Send, FileText, AlertCircle } from 'lucide-react'

/**
 * App Component with LTO Flat Design (Single Column Chat)
 *
 * Professional civic tech interface for Filipino motorists
 * Features:
 * - Flat UI aesthetic (no gradients, subtle borders)
 * - Philippine Blue primary color (#0038A8)
 * - Centered, distraction-free chat interface (No Sidebar)
 */
function AppContent() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Magandang araw! I am Maneho.ai, your Philippine traffic law assistant. How can I help you today?',
      citations: [],
    },
  ])

  // Apply dark mode to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleAskLawyer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    // Optimistic UI update for user message
    setMessages(prev => [...prev, { role: 'user', text: query, citations: [] }])
    setQuery('')

    // TODO: Wire up to tRPC mutation here
    // trpc.chat.askLawyer.useMutation()
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <Navbar onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      {/* Main Centered Chat Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col">
        {/* Warning/Disclaimer Banner */}
        <div className="mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-sm p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-400">
            <strong>Disclaimer:</strong> Maneho.ai provides AI-generated guidance based on official
            LTO documents. Always verify with actual traffic enforcers or official LTO branches for
            formal legal disputes.
          </p>
        </div>

        <Card className="flex-1 flex flex-col shadow-none rounded-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[65vh]">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100">
              <Scale className="text-primary" size={24} />
              Legal Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about LTO violations, fines, and road policies.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-sm px-5 py-4 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {/* Message Text */}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {/* Inline Citations (Only show for assistant if they exist) */}
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                        <FileText size={12} />
                        Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cite, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <form onSubmit={handleAskLawyer} className="flex w-full gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g., What is the fine for driving a colorum vehicle?"
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
              />
              <Button
                type="submit"
                className="rounded-sm shadow-none gap-2 px-6 bg-primary hover:bg-primary/90 text-white"
                disabled={!query.trim()}
              >
                <Send size={16} />
                Ask
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

/**
 * Main App Wrapper with Theme Provider
 */
export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
