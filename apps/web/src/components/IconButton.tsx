/**
 * IconButton — a fully-accessible icon-only button.
 *
 * Why this exists instead of <Button size="icon">:
 *  1. `label` is a required prop → impossible to ship an icon button without
 *     an accessible name (no accidental WCAG 4.1.2 failures).
 *  2. Automatically injects `aria-hidden="true"` and `focusable="false"` on
 *     the icon element so screen readers skip the raw SVG paths and only
 *     announce the human-readable label.
 *  3. Upgrades the focus ring to `ring-2` + `ring-offset-2` for WCAG 2.4.11
 *     (Focus Appearance, AAA) out of the box.
 *
 * Usage:
 *   import { Trash2 } from 'lucide-react'
 *   import { IconButton } from '~/components/IconButton'
 *
 *   // ✅ Correct — label is required
 *   <IconButton label="Delete conversation" icon={<Trash2 className="h-4 w-4" />} />
 *
 *   // Variants / sizes work just like <Button>
 *   <IconButton
 *     label="Send message"
 *     icon={<Send className="h-4 w-4" />}
 *     variant="default"
 *     onClick={handleSend}
 *     disabled={isPending}
 *   />
 */

import { forwardRef, cloneElement, type ReactElement } from 'react'
import { Button, type ButtonProps } from '@repo/ui/components/ui/button'
import { cn } from '@repo/ui/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  /**
   * Human-readable description of the button's action.
   * Rendered as `aria-label` — required to satisfy WCAG 4.1.2 (Name, Role, Value).
   * Keep it concise and action-oriented: "Delete conversation", "Toggle sidebar".
   */
  label: string

  /**
   * The icon element to display.
   * Pass a sized Lucide icon (or any SVG component):
   *   icon={<Trash2 className="h-4 w-4" />}
   * `aria-hidden` and `focusable` are injected automatically.
   */
  icon: ReactElement
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, variant = 'ghost', size = 'icon', className, ...props }, ref) => {
    // Clone the icon to inject a11y attributes without requiring callers to add them.
    // aria-hidden → screen readers skip the SVG element entirely.
    // focusable="false" → prevents IE/Edge from making the SVG focusable independently.
    const accessibleIcon = cloneElement(icon, {
      'aria-hidden': true,
      focusable: 'false',
    })

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        aria-label={label}
        className={cn(
          // Upgrade focus ring for better WCAG 2.4.11 visibility.
          // tailwind-merge inside cn() resolves the ring-1 → ring-2 conflict.
          'focus-visible:ring-2 focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {accessibleIcon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'
