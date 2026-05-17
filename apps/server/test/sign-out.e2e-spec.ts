import { app } from '@/app'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { AddressInfo } from 'node:net'
import { CookieJar } from 'tough-cookie'
import fetchCookie from 'fetch-cookie'
import { makeUser } from './factories/make-user'

let client: ReturnType<typeof createTRPCClient<AppRouter>>

const jar = new CookieJar()
const fetchWithCookies = fetchCookie(fetch, jar)

describe('Sign Out (e2e)', () => {
  beforeEach(async () => {
    await app.listen({ port: 0 })
    const { port } = app.server.address() as AddressInfo

    client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${port}/trpc`,
          fetch: fetchWithCookies,
        }),
      ],
    })
  })

  afterEach(async () => {
    await app.close()
  })

  it('[MUTATE] auth.signOut', async () => {
    const { email } = await makeUser({
      password: '@Password1',
      emailVerified: true,
    })

    await client.auth.signIn.mutate({
      email,
      password: '@Password1',
    })

    const result = await client.auth.signOut.mutate()

    expect(result.message).toBe('Goodbye!')
  })
})
