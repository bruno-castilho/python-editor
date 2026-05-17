import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { makeUser } from './factories/make-user'

let client: ReturnType<typeof createTRPCClient<AppRouter>>

describe('Forgot Password (e2e)', () => {
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

  it('[MUTATE] users.forgotPassword', async () => {
    const { email } = await makeUser({ emailVerified: true })

    const result = await client.users.forgotPassword.mutate({ email })

    expect(result.message).toBe(
      'You will receive an email to reset your password.',
    )
  })
})
