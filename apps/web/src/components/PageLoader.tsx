/**
 * PageLoader — shown by <Suspense> while lazy-loaded route chunks download.
 *
 * Keeps the full viewport height so the layout doesn't jump, and uses the
 * semantic CSS variables defined in style.css so it respects both light and
 * dark themes automatically.
 */

import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm font-medium">Loading…</span>
    </div>
  )
}
