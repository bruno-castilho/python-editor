import { publicProcedure, router } from '../index'
import { signInSchema } from '@python-editor/schemas/sign-in'
import { makeSignInUseCase } from '../use-cases/factories/make-sign-in'

export const authRouter = router({
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input, ctx }) => {
      const signInUseCase = makeSignInUseCase()
      const { user, accessToken, refreshToken } =
        await signInUseCase.execute(input)

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
        refreshToken,
        message: `Olá, ${user.name}! Que bom ter você por aqui 😊`,
      }
    }),
})

export type AuthRouter = typeof authRouter
