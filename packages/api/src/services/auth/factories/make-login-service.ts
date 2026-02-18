import { PasswordHasher } from '@python-editor/cryptography/hasher/password-hasher'
import { PrismaUsersRepository } from '@python-editor/db/prisma/prisma-users-repository'
import { LoginService } from '../login'
import { AccessToken } from '@python-editor/cryptography/jwt/access-token'
import { RefreshToken } from '@python-editor/cryptography/jwt/refresh-token'

export function makeLoginService() {
  const usersRepository = new PrismaUsersRepository()
  const accessToken = new AccessToken()
  const refreshToken = new RefreshToken()
  const passwordHasher = new PasswordHasher()

  return new LoginService(
    usersRepository,
    accessToken,
    refreshToken,
    passwordHasher,
  )
}
