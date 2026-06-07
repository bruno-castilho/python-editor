import db from '@python-editor/db'
import { UpdateProfileUseCase } from '../../domain/use-cases/update-profile'
import { UsersRepository } from '../gateways/repositories/users-repository'
import { PasswordHashCompare } from '../gateways/cryptography/hash-compare'
import { PasswordHashGenerator } from '../gateways/cryptography/hash-generator'

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
