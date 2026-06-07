import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/trpc/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { makeUser } from './factories/make-user'

let client: ReturnType<typeof createTRPCClient<AppRouter>>

describe('Sign In (e2e)', () => {
  beforeEach(async () => {
    await app.listen({ port: 0 })
    const { port } = app.server.address() as AddressInfo

    client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${port}/trpc`,
        }),
      ],
    })
  })

  afterEach(async () => {
    await app.close()
  })

  it('[MUTATE] auth.signIn', async () => {
    const { email, name } = await makeUser({
      password: '@Password1',
      emailVerified: true,
    })

    const result = await client.auth.signIn.mutate({
      email,
      password: '@Password1',
    })

    expect(result.message).toBe(`Hello, ${name}! Welcome back.`)
    expect(result.accessToken).toBeTruthy()
    expect(result.user.email).toBe(email)
  })
})
