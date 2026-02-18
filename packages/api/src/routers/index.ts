import { publicProcedure, router } from '../index'
import { authRouter } from './auth'
import { userRouter } from './users'

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK'
  }),
  user: userRouter,
  auth: authRouter,
})
export type AppRouter = typeof appRouter
