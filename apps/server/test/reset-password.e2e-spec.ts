import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { makeUser } from './factories/make-user'
import { makePasswordResetToken } from './factories/make-password-reset-token'

let client: ReturnType<typeof createTRPCClient<AppRouter>>

describe('Reset Password (e2e)', () => {
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

  it('[MUTATE] users.resetPassword', async () => {
    const { id: userId } = await makeUser({ emailVerified: true })

    const { token } = await makePasswordResetToken({ userId })

    const result = await client.users.resetPassword.mutate({
      token,
      password: 'NewPassword1!',
      repeatPassword: 'NewPassword1!',
    })

    expect(result.message).toBe('Password reset successfully!')
  })
})
