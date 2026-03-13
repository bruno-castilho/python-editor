import '@fastify/cookie'
import { AccessToken } from './cryptography/jwt/access-token'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { TRPCError } from '@trpc/server'
import { TokenExpiredError } from 'jsonwebtoken'

const accessToken = new AccessToken()

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  try {
    let session: { userId: string } | null = null

    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)

      const payload = accessToken.verify(token)
      session = { userId: payload.userId }
    }

    return {
      req,
      res,
      session,
    }
  } catch (error) {
    createContextErrorHandler(error)
  }
}

function createContextErrorHandler(error: unknown): never {
  if (error instanceof TokenExpiredError) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Token expired' })
  }
  throw error
}

export type Context = Awaited<ReturnType<typeof createContext>>
