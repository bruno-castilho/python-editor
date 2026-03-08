import { UsersRepository } from '../../repositories/users-repository'
import { PasswordHasher } from '../../cryptography/hasher/password-hasher'
import { AccessToken } from '../../cryptography/jwt/access-token'
import { RefreshToken } from '../../cryptography/jwt/refresh-token'
import { LoginUseCase } from '../login'

export function makeLoginUseCase() {
  const usersRepository = new UsersRepository()
  const accessToken = new AccessToken()
  const refreshToken = new RefreshToken()
  const passwordHasher = new PasswordHasher()

  return new LoginUseCase(
    usersRepository,
    accessToken,
    refreshToken,
    passwordHasher,
  )
}
