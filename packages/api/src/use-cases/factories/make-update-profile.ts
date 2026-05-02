import db from '@python-editor/db'
import { PasswordHashCompare } from '../../cryptography/hash-compare'
import { PasswordHashGenerator } from '../../cryptography/hash-generator'
import { UsersRepository } from '../../repositories/users-repository'
import { UpdateProfileUseCase } from '../update-profile'

export function makeUpdateProfileUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  const passwordHashCompare = new PasswordHashCompare()
  const passwordHashGenerator = new PasswordHashGenerator()

  return new UpdateProfileUseCase(
    usersRepository,
    passwordHashCompare,
    passwordHashGenerator,
  )
}
