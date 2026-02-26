/**
 * ErrorBoundary — catches unhandled render errors in the React tree.
 *
 * React error boundaries must be class components (the hook equivalent
 * does not exist). This implementation:
 *   - Shows a friendly recovery UI instead of a blank screen
 *   - Logs the error + component stack to the console (swap in Sentry here)
 *   - Exposes a "Try again" button that resets state
 *   - Optionally accepts a custom `fallback` prop for context-specific UIs
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyFeature />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<p>Something went wrong in the sidebar.</p>}>
 *     <Sidebar />
 *   </ErrorBoundary>
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  children: ReactNode
  /** Custom fallback UI. Rendered instead of the default error screen. */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Replace with your error-tracking service (e.g. Sentry.captureException)
    console.error('[ErrorBoundary] Uncaught error:', error)
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    // Custom fallback takes precedence
    if (this.props.fallback) {
      return this.props.fallback
    }

    // ── Default error screen ───────────────────────────────────────────────
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />
        </span>

        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Refreshing the page or clicking the button below usually
            fixes it.
          </p>
        </div>

        {/* Show error message only in development */}
        {import.meta.env.DEV && this.state.error && (
          <pre className="max-w-md rounded-md bg-muted px-4 py-3 text-left text-xs text-muted-foreground overflow-auto">
            {this.state.error.message}
          </pre>
        )}

        <Button variant="outline" size="sm" onClick={this.handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    )
  }
}
