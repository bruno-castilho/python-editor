import { publicProcedure, router } from '../index'
import { userRouter } from './users'

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK'
  }),
  user: userRouter,
})
export type AppRouter = typeof appRouter
