import Fastify, { type FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AddressInfo } from 'node:net'
import { appRouter, type AppRouter } from './index'
import { createContext } from '../context'
import { makePrismaUser } from '../../test/factories/make-user'
import { PasswordHashGenerator } from '../cryptography/hash-generator'
import { signInUser } from '../../test/utils/sign-in-user'
import { createAuthClient } from '../../test/utils/create-auth-client'
import fetchCookie from 'fetch-cookie'
import { CookieJar } from 'tough-cookie'

let app: FastifyInstance
let client: ReturnType<typeof createTRPCClient<AppRouter>>
let baseUrl: string
let passwordHashGenerator: PasswordHashGenerator

const jar = new CookieJar()
const fetchWithCookies = fetchCookie(fetch, jar)

describe('Auth Router', () => {
  beforeEach(async () => {
    app = Fastify({ logger: false })

    app.register(fastifyCookie)
    app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext,
      } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
    })

    await app.listen({ port: 0 })
    const { port } = app.server.address() as AddressInfo
    baseUrl = `http://localhost:${port}`

    client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${baseUrl}/trpc`,
          fetch: fetchWithCookies,
        }),
      ],
    })

    passwordHashGenerator = new PasswordHashGenerator()
  })

  afterEach(async () => {
    await app.close()
  })

  it('signIn', async () => {
    const hashedPassword = await passwordHashGenerator.hash('@Password1')
    const { email, name } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const result = await client.auth.signIn.mutate({
      email,
      password: '@Password1',
    })

    expect(result.message).toBe(`Hello, ${name}! Welcome back.`)
    expect(result.accessToken).toBeTruthy()
    expect(result.user.email).toBe(email)
  })

  it('sessionRefresh', async () => {
    const hashedPassword = await passwordHashGenerator.hash('@Password1')
    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    await signInUser(client, email, '@Password1')

    const result = await client.auth.sessionRefresh.mutate()

    expect(result.accessToken).toBeTruthy()
  })

  it('getUserSessions', async () => {
    const hashedPassword = await passwordHashGenerator.hash('@Password1')
    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const accessToken = await signInUser(client, email, '@Password1')
    const authClient = createAuthClient(baseUrl, accessToken)

    const result = await authClient.auth.getUserSessions.query()

    expect(result.sessions.length).toBeGreaterThan(0)
  })

  it('revokeUserSession', async () => {
    const hashedPassword = await passwordHashGenerator.hash('@Password1')
    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const accessToken = await signInUser(client, email, '@Password1')
    const authClient = createAuthClient(baseUrl, accessToken)

    const { sessions } = await authClient.auth.getUserSessions.query()
    const [firstSession] = sessions

    const result = await authClient.auth.revokeUserSession.mutate({
      sessionId: firstSession!.sessionId,
    })

    expect(result.message).toBe('Session revoked successfully.')
  })

  it('signOut', async () => {
    const hashedPassword = await passwordHashGenerator.hash('@Password1')
    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    await signInUser(client, email, '@Password1')

    const result = await client.auth.signOut.mutate()

    expect(result.message).toBe('Goodbye!')
  })
})
