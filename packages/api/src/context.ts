import '@fastify/cookie'
import { AccessToken } from './cryptography/jwt/access-token'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

const accessToken = new AccessToken()

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  let session: { userId: string } | null = null

  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const payload = accessToken.verify(token)
      session = { userId: payload.userId }
    } catch {}
  }

  return {
    req,
    res,
    session,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
