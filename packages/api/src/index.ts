import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'
import { handleError } from './handle-error'

export { TRPCError } from '@trpc/server'

export const t = initTRPC.context<Context>().create()

export const router = t.router

const errorHandlerMiddleware = t.middleware(async ({ next }) => {
  const result = await next()
  if (!result.ok) {
    handleError(result.error.cause ?? result.error)
  }
  return result
})

export const publicProcedure = t.procedure.use(errorHandlerMiddleware)

export const authenticatedProcedure = t.procedure
  .use(errorHandlerMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be authenticated to access this resource.',
      })
    }
    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    })
  })
