import { Link } from 'react-router-dom'
import { Button } from '@repo/ui/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-4">Page not found</p>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  )
}
