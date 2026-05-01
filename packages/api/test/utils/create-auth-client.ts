import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../src/routers'

export function createAuthClient(baseUrl: string, accessToken: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        headers: { authorization: `Bearer ${accessToken}` },
      }),
    ],
  })
}
