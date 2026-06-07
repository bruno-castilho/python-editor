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

describe('Find Shared With Me Projects (e2e)', () => {
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

  it('[QUERY] projects.findSharedWithMeProjects', async () => {
    const { id: ownerId } = await makeUser({})

    const projects = await Promise.all([
      makeProject({
        createdById: ownerId,
        updatedById: ownerId,
      }),
      makeProject({
        createdById: ownerId,
        updatedById: ownerId,
      }),
      makeProject({
        createdById: ownerId,
        updatedById: ownerId,
      }),
    ])

    await Promise.all(
      projects.map((project) =>
        shareProject({
          userId: authenticatedUser.id,
          projectId: project.id,
        }),
      ),
    )

    const firstPage = await client.projects.findSharedWithMeProjects.query({
      page: 0,
      perPage: 1,
    })

    expect(firstPage.message).toBe(
      'Shared with me projects retrieved successfully.',
    )
    expect(firstPage.projects.length).toBe(1)
    expect(firstPage.totalCount).toBe(3)

    const secondPage = await client.projects.findSharedWithMeProjects.query({
      page: 1,
      perPage: 2,
    })

    expect(secondPage.message).toBe(
      'Shared with me projects retrieved successfully.',
    )
    expect(secondPage.projects.length).toBe(1)
    expect(secondPage.totalCount).toBe(3)
  })
})
