import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/trpc/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { makeUser } from './factories/make-user'

let client: ReturnType<typeof createTRPCClient<AppRouter>>

describe('Resend Verification Email (e2e)', () => {
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

  it('[MUTATE] users.resendVerificationEmail', async () => {
    const { email } = await makeUser({})

    const result = await client.users.resendVerificationEmail.mutate({ email })

    expect(result.message).toBe('A new link has been sent to your email.')
  })
})
