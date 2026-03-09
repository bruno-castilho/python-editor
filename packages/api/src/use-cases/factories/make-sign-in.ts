import { UsersRepository } from '../../repositories/users-repository'
import { PasswordHasher } from '../../cryptography/hasher/password-hasher'
import { AccessToken } from '../../cryptography/jwt/access-token'
import { RefreshToken } from '../../cryptography/jwt/refresh-token'
import { SignInUseCase } from '../sign-in'

export function makeSignInUseCase() {
  const usersRepository = new UsersRepository()
  const accessToken = new AccessToken()
  const refreshToken = new RefreshToken()
  const passwordHasher = new PasswordHasher()

  return new SignInUseCase(
    usersRepository,
    accessToken,
    refreshToken,
    passwordHasher,
  )
}
