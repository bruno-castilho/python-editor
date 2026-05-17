import { makeUser } from './factories/make-user'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import type { UserWithoutPassword } from '@python-editor/api/repositories/types/user'
import { makeSession } from './factories/make-session'
import { makeProject } from './factories/make-project'

let client: ReturnType<typeof createTRPCClient<AppRouter>>
let authenticatedUser: UserWithoutPassword

describe('Remove Project (e2e)', () => {
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

  it('[MUTATE] projects.removeProject', async () => {
    const project = await makeProject({
      createdById: authenticatedUser.id,
      updatedById: authenticatedUser.id,
    })

    const result = await client.projects.removeProject.mutate({
      projectId: project.id,
    })

    expect(result.message).toBe('Project removed successfully.')
  })
})
