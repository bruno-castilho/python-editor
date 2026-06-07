import { makeUser } from './factories/make-user'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'

import { makeSession } from './factories/make-session'
import { makeProject } from './factories/make-project'
import type { UserWithoutPassword } from '@python-editor/core/domain/types/user'

let client: ReturnType<typeof createTRPCClient<AppRouter>>
let authenticatedUser: UserWithoutPassword

describe('Find Personal Projects (e2e)', () => {
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

  it('[QUERY] projects.findPersonalProjects', async () => {
    await Promise.all([
      makeProject({
        createdById: authenticatedUser.id,
        updatedById: authenticatedUser.id,
      }),
      makeProject({
        createdById: authenticatedUser.id,
        updatedById: authenticatedUser.id,
      }),
      makeProject({
        createdById: authenticatedUser.id,
        updatedById: authenticatedUser.id,
      }),
    ])
    const firstPage = await client.projects.findPersonalProjects.query({
      page: 0,
      perPage: 1,
    })

    expect(firstPage.message).toBe('Personal projects retrieved successfully.')
    expect(firstPage.projects.length).toBe(1)
    expect(firstPage.totalCount).toBe(3)

    const secondPage = await client.projects.findPersonalProjects.query({
      page: 1,
      perPage: 2,
    })

    expect(secondPage.message).toBe('Personal projects retrieved successfully.')
    expect(secondPage.projects.length).toBe(1)
    expect(secondPage.totalCount).toBe(3)
  })
})
