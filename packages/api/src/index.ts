import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'

export { TRPCError } from '@trpc/server'

export const t = initTRPC.context<Context>().create()

export const router = t.router

export const publicProcedure = t.procedure

export const authenticatedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar autenticado para acessar este recurso.',
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})
