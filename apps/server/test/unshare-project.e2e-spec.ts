import { makeUser } from './factories/make-user'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/trpc/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { makeSession } from './factories/make-session'
import { makeProject } from './factories/make-project'
import { shareProject } from './helpers/share-project'
import type { UserWithoutPassword } from '@python-editor/core/domain/types/user'

let client: ReturnType<typeof createTRPCClient<AppRouter>>
let authenticatedUser: UserWithoutPassword

describe('Ushare Project (e2e)', () => {
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

  it('[MUTATE] projects.ushareProject', async () => {
    const { id: targetId, email: targetEmail } = await makeUser({})

    const project = await makeProject({
      createdById: authenticatedUser.id,
      updatedById: authenticatedUser.id,
    })

    await shareProject({
      projectId: project.id,
      userId: targetId,
    })

    const result = await client.projects.unshareProject.mutate({
      projectId: project.id,
      email: targetEmail,
    })

    expect(result.message).toBe('Project unshared successfully.')
  })
})
