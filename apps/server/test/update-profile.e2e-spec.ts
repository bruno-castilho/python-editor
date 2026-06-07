import { makeUser } from './factories/make-user'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/trpc/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import type { UserWithoutPassword } from '@python-editor/core/domain/types/user'
import { makeSession } from './factories/make-session'

let client: ReturnType<typeof createTRPCClient<AppRouter>>
let authenticatedUser: UserWithoutPassword

describe('Update Profile (e2e)', () => {
  beforeEach(async () => {
    authenticatedUser = await makeUser({
      password: '@Password1',
      emailVerified: true,
    })

    const { accessToken } = await makeSession({
      userId: authenticatedUser.id,
    })

    await app.listen({ port: 0 })
    const { port } = app.server.address() as AddressInfo

    client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${port}/trpc`,
          headers: { authorization: `Bearer ${accessToken}` },
        }),
      ],
    })
  })

  afterEach(async () => {
    await app.close()
  })

  it('[MUTATE] users.updateProfile', async () => {
    const result = await client.users.updateProfile.mutate({
      name: 'new-name',
      lastName: 'new-last-name',
      password: '@Password1',
    })

    expect(result.message).toBe('Profile updated successfully!')
  })
})
