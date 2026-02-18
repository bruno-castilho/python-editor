import '@fastify/cookie'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  return {
    req,
    res,
    session: null,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
