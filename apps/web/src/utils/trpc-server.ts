import type { AppRouter } from '@python-editor/api/routers/index'
import { env } from '@python-editor/env/web'
import { createTRPCClient, httpBatchLink } from '@trpc/client'

export const trpcServer = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.NEXT_PUBLIC_SERVER_URL}/trpc`,
    }),
  ],
})
