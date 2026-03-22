import { authenticatedProcedure, publicProcedure, router } from '../index'
import { signInSchema } from '@python-editor/schemas/sign-in'
import { makeSignInUseCase } from '../use-cases/factories/make-sign-in'
import { makeSessionRefreshUseCase } from '../use-cases/factories/make-session-refresh'
import { makeGetUserSessionsUseCase } from '../use-cases/factories/make-get-user-sessions'
import { makeRevokeUserSessionUseCase } from '../use-cases/factories/make-revoke-user-session'
import { makeSignOutUseCase } from '../use-cases/factories/make-sign-out'
import { TRPCError } from '@trpc/server'
import { parseSessionInfo } from '../utils/parse-session-info'
import { z } from 'zod'

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

  getUserSessions: authenticatedProcedure.query(async ({ ctx }) => {
    const useCase = makeGetUserSessionsUseCase()
    return await useCase.execute({ userId: ctx.session.userId })
  }),

  revokeUserSession: authenticatedProcedure
    .input(z.object({ sessionId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const useCase = makeRevokeUserSessionUseCase()
      await useCase.execute({
        sessionId: input.sessionId,
        userId: ctx.session.userId,
      })
      return { message: 'Session revoked successfully.' }
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
