import { PasswordHashCompare } from '../../cryptography/hash-compare'
import { AccessTokenSign, RefreshTokenSign } from '../../cryptography/jwt-sign'
import { UsersRepository } from '../../repositories/users-repository'

import { SignInUseCase } from '../sign-in'

export function makeSignInUseCase() {
  const usersRepository = new UsersRepository()
  const accessTokenSign = new AccessTokenSign()
  const refreshTokenSign = new RefreshTokenSign()
  const passwordHashCompare = new PasswordHashCompare()

  return new SignInUseCase(
    usersRepository,
    accessTokenSign,
    refreshTokenSign,
    passwordHashCompare,
  )
}
