import { makeUser } from './factories/make-user'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import type { UserWithoutPassword } from '@python-editor/api/repositories/types/user'
import { makeSession } from './factories/make-session'

let client: ReturnType<typeof createTRPCClient<AppRouter>>
let authenticatedUser: UserWithoutPassword

describe('Get Profile (e2e)', () => {
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

  it('[QUERY] users.getProfile', async () => {
    const result = await client.users.getProfile.query()

    expect(result.user.id).toBe(authenticatedUser.id)
    expect(result.user.email).toBe(authenticatedUser.email)
    expect(result.user.name).toBe(authenticatedUser.name)
    expect(result.user.lastName).toBe(authenticatedUser.lastName)
  })
})
