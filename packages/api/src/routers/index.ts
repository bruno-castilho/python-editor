import { publicProcedure, router } from '../index'
import { authRouter } from './auth'
import { usersRouter } from './users'

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK'
  }),
  users: usersRouter,
  auth: authRouter,
})
export type AppRouter = typeof appRouter
