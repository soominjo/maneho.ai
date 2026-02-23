import { Plus } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'

interface AskLawyerNavbarProps {
  quota: { used: number; limit: number }
  onNewChat: () => void
}

/**
 * AskLawyerNavbar - Specialized navbar for the Ask Lawyer page
 * Features Philippine Blue branding, quota display, and quick new chat button
 */
export function AskLawyerNavbar({ quota, onNewChat }: AskLawyerNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-blue-700 border-b border-blue-800 shadow-none">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo + Bot Name */}
        <div className="flex items-center gap-3">
          <img src="/maneho-bot.png" alt="ManehoBot" className="w-10 h-10" />
          <div>
            <h1 className="text-white font-bold text-lg">ManehoBot</h1>
            <p className="text-blue-200 text-xs">Legal AI Assistant</p>
          </div>
        </div>

        {/* Right: Quota Display + New Chat Button */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-800 border border-blue-600 rounded-sm px-3 py-1.5">
            <span className="text-yellow-400 font-bold text-sm">
              {quota.limit - quota.used}/{quota.limit}
            </span>
            <span className="text-blue-200 text-xs ml-1">credits</span>
          </div>
          <Button
            onClick={onNewChat}
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-blue-600 rounded-sm shadow-none"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Chat
          </Button>
        </div>
      </div>
    </nav>
  )
}
