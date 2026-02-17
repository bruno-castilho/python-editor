import { PasswordHasher } from '@python-editor/cryptography/hasher/password-hasher'
import { PrismaUsersRepository } from '@python-editor/db/prisma/prisma-users-repository'
import { RegisterUserService } from '../register-user-service'

export function makeRegisterUserService() {
  const usersRepository = new PrismaUsersRepository()
  const passwordHasher = new PasswordHasher()

  return new RegisterUserService(usersRepository, passwordHasher)
}
