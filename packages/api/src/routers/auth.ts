import { publicProcedure, router } from '../index'
import { signInSchema } from '@python-editor/schemas/sign-in'
import { signInErrorHandler } from './error-handlers/sign-in-error-handler'
import { refreshTokenErrorHandler } from './error-handlers/refresh-token-error-handler'
import { makeSignInUseCase } from '../use-cases/factories/make-sign-in'
import { makeSessionRefreshUseCase } from '../use-cases/factories/make-session-refresh'
import { TRPCError } from '@trpc/server'

export const authRouter = router({
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input: dto, ctx }) => {
      try {
        const signInUseCase = makeSignInUseCase()
        const { user, accessToken, refreshToken } = await signInUseCase.execute(
          {
            dto,
          },
        )

        ctx.res.setCookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
        })

        return {
          user,
          accessToken,
          message: `Hello, ${user.name}! Welcome back.`,
        }
      } catch (error) {
        signInErrorHandler(error)
      }
    }),

  sessionRefresh: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const refreshToken = ctx.req.cookies.refresh_token

      if (!refreshToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Missing refresh token.',
        })
      }

      const sessionRefreshUseCase = makeSessionRefreshUseCase()

      const { accessToken, refreshToken: newRefreshToken } =
        await sessionRefreshUseCase.execute({ refreshToken })

      ctx.res.setCookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      })

      return { accessToken }
    } catch (error) {
      refreshTokenErrorHandler(error)
    }
  }),
})

export type AuthRouter = typeof authRouter
