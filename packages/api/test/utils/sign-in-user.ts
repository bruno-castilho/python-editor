import type { createTRPCClient } from '@trpc/client'
import type { AppRouter } from '../../src/routers'

export async function signInUser(
  client: ReturnType<typeof createTRPCClient<AppRouter>>,
  email: string,
  password: string,
) {
  const result = await client.auth.signIn.mutate({ email, password })
  return result.accessToken
}
