import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@python-editor/trpc/routers/index'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'

let client: ReturnType<typeof createTRPCClient<AppRouter>>

describe('Register User (e2e)', () => {
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

  it('[MUTATE] users.registerUser', async () => {
    const result = await client.users.registerUser.mutate({
      name: 'Jhon',
      lastName: 'Doe',
      email: 'jhondoe2@mail.com',
      password: 'Password1!',
      repeatPassword: 'Password1!',
    })

    expect(result.message).toBe(
      'Account created successfully! Check your email to activate your account.',
    )
  })
})
