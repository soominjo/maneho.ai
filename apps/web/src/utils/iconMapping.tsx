/**
 * Icon Mapping Utility
 * Maps Material Symbols icon names to Lucide React equivalents
 * Used to maintain consistent icon system while supporting new design
 */

import {
  Scale, // gavel - Legal/law icon
  Bot, // smart_toy - AI bot icon
  Bell, // notifications - Notifications
  MessageCircle, // chat_bubble - Chat/conversation
  Clock, // history - History/recent
  Settings, // settings - Settings
  Plus, // add - Add/new
  Paperclip, // attach_file - Attachment
  Send, // send - Send message
  BookOpen, // menu_book - Reference/documentation
  FileText, // assignment - Form/document
  User, // person - User avatar
  Menu, // menu - Hamburger menu
  X, // close - Close button
  AlertTriangle, // warning - Warning
  CheckCircle, // check_circle - Confirmation
  Home, // home - Home/dashboard
  FileCheck, // file_check - Ticket decoder
  Zap, // lightning - Performance/quick
  Lightbulb, // lightbulb - Ideas/suggestions
} from 'lucide-react'

export const iconMap = {
  // Navigation & UI
  gavel: Scale,
  smart_toy: Bot,
  notifications: Bell,
  chat_bubble: MessageCircle,
  history: Clock,
  settings: Settings,
  menu: Menu,
  close: X,
  home: Home,
  person: User,

  // Actions
  add: Plus,
  attach_file: Paperclip,
  send: Send,

  // References & Documentation
  menu_book: BookOpen,
  balance: Scale,
  assignment: FileText,

  // Status
  check_circle: CheckCircle,
  warning: AlertTriangle,

  // Features
  file_check: FileCheck,
  zap: Zap,
  lightbulb: Lightbulb,
} as const

/**
 * Get Lucide icon component by Material Symbols name
 * @param name Material Symbols icon name (e.g., 'gavel', 'smart_toy')
 * @returns Lucide React icon component
 */
export function getIcon(name: keyof typeof iconMap) {
  return iconMap[name]
}

/**
 * Icon wrapper component for consistent sizing and styling
 */
export interface IconProps {
  name: keyof typeof iconMap
  size?: number
  className?: string
  title?: string
}

export function Icon({ name, size = 20, className = '', title }: IconProps) {
  const IconComponent = iconMap[name]
  return (
    <div title={title} className="inline-flex">
      <IconComponent size={size} className={className} strokeWidth={2} />
    </div>
  )
}
