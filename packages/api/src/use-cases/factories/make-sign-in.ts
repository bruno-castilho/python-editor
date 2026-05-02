import db from '@python-editor/db'
import { PasswordHashCompare } from '../../cryptography/hash-compare'
import { AccessTokenSign, RefreshTokenSign } from '../../cryptography/jwt-sign'
import { UsersRepository } from '../../repositories/users-repository'
import { UserSessionsKeyValueStore } from '../../key-value-stores/user-sessions-key-value-store'
import { SignInUseCase } from '../sign-in'

export function makeSignInUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  const accessTokenSign = new AccessTokenSign()
  const refreshTokenSign = new RefreshTokenSign()
  const passwordHashCompare = new PasswordHashCompare()
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()

  return new SignInUseCase(
    usersRepository,
    accessTokenSign,
    refreshTokenSign,
    passwordHashCompare,
    userSessionsKeyValueStore,
  )
}
