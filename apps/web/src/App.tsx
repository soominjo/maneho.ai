import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
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
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col font-sans">
      {/* Navbar */}
      <Navbar onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      {/* Main Centered Chat Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col">
        {/* Warning/Disclaimer Banner */}
        <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-sm p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Disclaimer:</strong> Maneho.ai provides AI-generated guidance based on official
            LTO documents. Always verify with actual traffic enforcers or official LTO branches for
            formal legal disputes.
          </p>
        </div>

        <Card className="flex-1 flex flex-col shadow-none rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[60vh]">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-blue-700 text-white">
                <Scale size={20} />
              </div>
              Legal Assistant
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Ask questions about LTO violations, fines, and traffic regulations
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
                      ? 'bg-blue-700 text-white border border-blue-700 dark:border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {/* Message Text */}
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  )}

                  {/* Inline Citations (Only show for assistant if they exist) */}
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1 uppercase tracking-wide">
                        <FileText size={12} />
                        Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cite, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
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

          <CardFooter className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <form onSubmit={handleAskLawyer} className="flex w-full flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g., What is the fine for driving a colorum vehicle?"
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 text-sm transition-colors"
                />
                <Button
                  type="submit"
                  className="rounded-sm shadow-none gap-2 px-6 bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 text-white border-0 font-semibold"
                  disabled={!query.trim()}
                >
                  <Send size={16} />
                  Ask
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Maneho.ai can make mistakes. Always verify with official LTO documentation or a legal professional.
              </p>
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
