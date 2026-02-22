import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@repo/functions/router'

export const trpc = createTRPCReact<AppRouter>()

/**
 * Construct the full tRPC endpoint URL
 * Example: http://localhost:3001 → http://localhost:3001/trpc
 */
function getTRPCEndpoint(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  return `${apiUrl}/trpc`
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getTRPCEndpoint(),
      // Enable batch requests for efficiency (multiple calls in single HTTP request)
      maxURLLength: 2083, // Standard browser URL length limit
    }),
  ],
})
