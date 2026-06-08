import { AccessTokenVerify } from '@python-editor/core/infra/gateways/cryptography/jwt-verify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'

const accessTokenVerify = new AccessTokenVerify()

export async function onlyUserMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Unauthorized.' })
    }

    const token = authHeader.slice(7)
    const payload = accessTokenVerify.verifyAndParse(token)
    request.session = payload
  } catch (error) {
    onlyUserMiddlewareErrorHandler(error, reply)
  }
}

function onlyUserMiddlewareErrorHandler(error: unknown, reply: FastifyReply) {
  if (error instanceof jwt.TokenExpiredError) {
    return reply.status(401).send({ message: 'Token expired.' })
  }

  return reply.status(500).send({ message: 'Internal server error.' })
}
