import React from 'react'
import { cn } from '@repo/ui/lib/utils'

interface BotIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-5 h-5', // 20px - Inline elements
  md: 'w-8 h-8', // 32px - Chat bubbles (current standard)
  lg: 'w-12 h-12', // 48px - Welcome screens
}

export const BotIcon = React.memo(({ size = 'md', className }: BotIconProps) => {
  return (
    <img
      src="/new-maneho-bot-removebg-preview.png"
      alt="Maneho AI Bot"
      className={cn('aspect-square object-contain flex-shrink-0', sizeMap[size], className)}
    />
  )
})

BotIcon.displayName = 'BotIcon'
