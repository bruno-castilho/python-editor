import '@fastify/cookie'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'
import { AccessTokenVerify } from './cryptography/jwt-verify'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

const accessTokenVerify = new AccessTokenVerify()

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  try {
    let session: JWTPayloadDTO | null = null

    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)

      session = accessTokenVerify.verifyAndParse(token)
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
  if (error instanceof jwt.TokenExpiredError) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Token expired' })
  }
  throw error
}

export type Context = Awaited<ReturnType<typeof createContext>>
