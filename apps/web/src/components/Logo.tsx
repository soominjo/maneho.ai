import React from 'react'
import { cn } from '@repo/ui/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8', // 32px - Compact navbar
  md: 'w-10 h-10', // 40px - Public navbar (current)
  lg: 'w-12 h-12', // 48px - Page headers
  xl: 'w-14 h-14', // 56px - Dashboard navbar (current)
}

export const Logo = React.memo(({ size = 'md', className }: LogoProps) => {
  return (
    <img
      src="/new-maneho-logo-removebg-preview.png"
      alt="Maneho AI Logo"
      className={cn('aspect-square object-contain flex-shrink-0', sizeMap[size], className)}
    />
  )
})

Logo.displayName = 'Logo'
