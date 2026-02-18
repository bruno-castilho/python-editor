import { publicProcedure, router } from '../index'
import { loginSchema } from '@python-editor/schemas/login'
import { makeLoginService } from '../services/auth/factories/make-login-service'

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const loginService = makeLoginService()
    const { user, accessToken, refreshToken } =
      await loginService.execute(input)

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
