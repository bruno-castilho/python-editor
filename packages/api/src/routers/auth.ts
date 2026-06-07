import { publicProcedure, router } from '../index'
import { signInSchema } from '@python-editor/schemas/sign-in'
import { makeSignInUseCase } from '../infra/factories/make-sign-in'
import { makeSessionRefreshUseCase } from '../infra/factories/make-session-refresh'
import { makeSignOutUseCase } from '../infra/factories/make-sign-out'
import { TRPCError } from '@trpc/server'
import { parseSessionInfo } from '../utils/parse-session-info'

export const authRouter = router({
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input: dto, ctx }) => {
      const signInUseCase = makeSignInUseCase()
      const sessionInfo = parseSessionInfo(ctx.req)

      const { user, accessToken, refreshToken } = await signInUseCase.execute({
        dto,
        sessionInfo,
      })

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
    }),

  sessionRefresh: publicProcedure.mutation(async ({ ctx }) => {
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
  }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.req.cookies.refresh_token

    if (!refreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Missing refresh token.',
      })
    }

    ctx.res.clearCookie('refresh_token', { path: '/' })

    const useCase = makeSignOutUseCase()
    await useCase.execute({ refreshToken })

    return { message: 'Goodbye!' }
  }),
})

export type AuthRouter = typeof authRouter
