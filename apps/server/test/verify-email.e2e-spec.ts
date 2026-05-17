import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { makeUser } from './factories/make-user'
import { makeEmailVerificationToken } from './factories/make-email-verification-token'

let client: ReturnType<typeof createTRPCClient<AppRouter>>

describe('Verify Email (e2e)', () => {
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

  it('[MUTATE] users.verifyEmail', async () => {
    const { id: userId } = await makeUser({ emailVerified: false })

    const { token } = await makeEmailVerificationToken({ userId })

    const result = await client.users.verifyEmail.mutate({ token })

    expect(result.message).toBe('Email verified successfully!')
  })
})
