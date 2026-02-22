import { ShieldCheck, Scale, FileText, Menu } from 'lucide-react'
import { Button } from './ui/button'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="flex h-16 items-center px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex items-center gap-2 mr-8">
          <div className="bg-blue-700 p-1.5 rounded text-white">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Maneho<span className="text-blue-700 dark:text-blue-500">.ai</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
            <Scale size={16} /> Legal Chat
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
            <FileText size={16} /> Traffic Rules
          </a>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="outline"
            className="hidden md:inline-flex shadow-none border-slate-200 rounded-sm"
          >
            Sign In
          </Button>
          <Button className="shadow-none rounded-sm bg-blue-700 hover:bg-blue-800 text-white">
            Ask Lawyer
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={24} />
          </Button>
        </div>
      </div>
    </nav>
  )
}
