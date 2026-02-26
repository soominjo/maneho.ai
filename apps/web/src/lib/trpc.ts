import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@repo/functions/router'

export const trpc = createTRPCReact<AppRouter>()

const getBaseUrl = () => {
  // If we're in a browser, ALWAYS use a relative path for production
  if (typeof window !== 'undefined') {
    return '/api'
  }
  // Only use localhost if specifically running in a local Node environment
  return process.env.VITE_API_URL || 'http://localhost:3001'
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      // Enable batch requests for efficiency (multiple calls in single HTTP request)
      maxURLLength: 2083, // Standard browser URL length limit
    }),
  ],
})
