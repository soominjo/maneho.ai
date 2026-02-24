import React from 'react'
import { cn } from '@repo/ui/lib/utils'

interface LayoutWrapperProps {
  children: React.ReactNode
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  className?: string
}

const maxWidthVariants = {
  narrow: 'max-w-4xl', // 1024px - Forms, focused content
  default: 'max-w-6xl', // 1152px - Standard pages (80% at 1440px) ⭐ PRIMARY
  wide: 'max-w-7xl', // 1280px - Dashboard, multi-column layouts
  full: 'max-w-none', // No limit - Full bleed
}

export function LayoutWrapper({ children, maxWidth = 'default', className }: LayoutWrapperProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        'px-4 md:px-6 lg:px-8', // Mobile-first responsive padding
        maxWidthVariants[maxWidth],
        className
      )}
    >
      {children}
    </div>
  )
}
