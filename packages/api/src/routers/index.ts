import { publicProcedure, router } from '../index'
import { authRouter } from './auth'
import { usersRouter } from './users'
import { projectsRouter } from './projects'

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK'
  }),
  users: usersRouter,
  auth: authRouter,
  projects: projectsRouter,
})
export type AppRouter = typeof appRouter
