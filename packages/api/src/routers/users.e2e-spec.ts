import Fastify, { type FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { faker } from '@faker-js/faker'
import type { AddressInfo } from 'node:net'
import { appRouter, type AppRouter } from './index'
import { createContext } from '../context'
import { makePrismaUser } from '../../test/factories/make-user'
import { PasswordHashGenerator } from '../cryptography/hash-generator'
import { signInUser } from '../../test/utils/sign-in-user'
import { createAuthClient } from '../../test/utils/create-auth-client'

let app: FastifyInstance
let client: ReturnType<typeof createTRPCClient<AppRouter>>
let baseUrl: string
let passwordHashGenerator: PasswordHashGenerator

const MAILHOG_URL = `http://${process.env.SMTP_HOST ?? 'localhost'}:8025`

type MailhogPart = {
  Body: string
  MIME?: { Parts?: MailhogPart[] }
}

type MailhogMessage = {
  To: Array<{ Mailbox: string; Domain: string }>
  Content: { Body: string }
  MIME: { Parts: MailhogPart[] } | null
}

function decodeBody(raw: string): string[] {
  const results: string[] = [raw]

  // Quoted-printable: remove soft line breaks then decode =XX sequences
  const qp = raw
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h: string) =>
      String.fromCharCode(parseInt(h, 16)),
    )
  results.push(qp)

  // Base64: attempt decode if it looks like base64
  const stripped = raw.replace(/\s/g, '')
  if (/^[A-Za-z0-9+/]+=*$/.test(stripped) && stripped.length > 0) {
    try {
      results.push(Buffer.from(stripped, 'base64').toString('utf-8'))
    } catch {
      // not valid base64, ignore
    }
  }

  return results
}

async function getEmailToken(recipientEmail: string): Promise<string> {
  const res = await fetch(`${MAILHOG_URL}/api/v2/messages?limit=50`)
  const data = (await res.json()) as { items: MailhogMessage[] }

  const message = data.items.find((m) =>
    m.To.some(
      (t) =>
        `${t.Mailbox}@${t.Domain}`.toLowerCase() ===
        recipientEmail.toLowerCase(),
    ),
  )

  if (!message) throw new Error(`No email found for ${recipientEmail}`)

  const rawBodies: string[] = [message.Content.Body]

  function collectParts(parts: MailhogPart[]) {
    for (const part of parts) {
      rawBodies.push(part.Body)
      if (part.MIME?.Parts) collectParts(part.MIME.Parts)
    }
  }
  if (message.MIME?.Parts) collectParts(message.MIME.Parts)

  const bodies = rawBodies.flatMap(decodeBody)

  const regex = /[?&]token=([a-f0-9]{64})/
  for (const body of bodies) {
    const match = body.match(regex)
    if (match?.[1]) return match[1]
  }

  throw new Error(`Token not found in email for ${recipientEmail}`)
}

describe('Users Router', () => {
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
      links: [httpBatchLink({ url: `${baseUrl}/trpc` })],
    })

    passwordHashGenerator = new PasswordHashGenerator()
  })

  afterEach(async () => {
    await app.close()
  })

  it('registerUser', async () => {
    const password = 'Password1!'

    const result = await client.users.registerUser.mutate({
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password,
      repeatPassword: password,
    })

    expect(result.message).toBe(
      'Account created successfully! Check your email to activate your account.',
    )
  })

  it('resendVerificationEmail', async () => {
    const { email } = await makePrismaUser({})

    const result = await client.users.resendVerificationEmail.mutate({ email })

    expect(result.message).toBe('A new link has been sent to your email.')
  })

  it('verifyEmail', async () => {
    const { email } = await makePrismaUser({})

    await client.users.resendVerificationEmail.mutate({ email })

    const token = await getEmailToken(email)

    const result = await client.users.verifyEmail.mutate({ token })

    expect(result.message).toBe('Email verified successfully!')
  })

  it('forgotPassword', async () => {
    const { email } = await makePrismaUser({ emailVerified: true })

    const result = await client.users.forgotPassword.mutate({ email })

    expect(result.message).toBe(
      'You will receive an email to reset your password.',
    )
  })

  it('resetPassword', async () => {
    const { email } = await makePrismaUser({ emailVerified: true })

    await client.users.forgotPassword.mutate({ email })

    const token = await getEmailToken(email)
    const newPassword = 'NewPassword1!'

    const result = await client.users.resetPassword.mutate({
      token,
      password: newPassword,
      repeatPassword: newPassword,
    })

    expect(result.message).toBe('Password reset successfully!')
  })

  it('getProfile', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)
    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const accessToken = await signInUser(client, email, password)

    const authClient = createAuthClient(baseUrl, accessToken)
    const result = await authClient.users.getProfile.query()

    expect(result.user.email).toBe(email)
  })

  it('updateProfile', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)
    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const accessToken = await signInUser(client, email, password)

    const authClient = createAuthClient(baseUrl, accessToken)
    const result = await authClient.users.updateProfile.mutate({
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password,
    })

    expect(result.message).toBe('Profile updated successfully!')
  })

  it('removeAvatar', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)

    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const accessToken = await signInUser(client, email, password)

    const authClient = createAuthClient(baseUrl, accessToken)
    const result = await authClient.users.removeAvatar.mutate()

    expect(result.message).toBe('Avatar removed successfully!')
  })

  it('getUserSessions', async () => {
    const hashedPassword = await passwordHashGenerator.hash('@Password1')
    const { email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const accessToken = await signInUser(client, email, '@Password1')
    const authClient = createAuthClient(baseUrl, accessToken)

    const result = await authClient.users.getUserSessions.query()

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

    const { sessions } = await authClient.users.getUserSessions.query()

    const [firstSession] = sessions

    const result = await authClient.users.revokeUserSession.mutate({
      sessionId: firstSession!.sessionId,
    })

    expect(result.message).toBe('Session revoked successfully.')
  })
})
