import db from '@python-editor/db'
import { SignInUseCase } from '../../domain/use-cases/sign-in'
import { UsersRepository } from '../gateways/repositories/users-repository'
import {
  AccessTokenSign,
  RefreshTokenSign,
} from '../gateways/cryptography/jwt-sign'
import { PasswordHashCompare } from '../gateways/cryptography/hash-compare'
import { UserSessionsKeyValueStore } from '../gateways/valkey/user-sessions-key-value-store'

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
