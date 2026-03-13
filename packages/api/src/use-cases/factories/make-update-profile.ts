import { UsersRepository } from '../../repositories/users-repository'
import { PasswordHasher } from '../../cryptography/hasher/password-hasher'
import { UpdateProfileUseCase } from '../update-profile'

export function makeUpdateProfileUseCase() {
  const usersRepository = new UsersRepository()
  const passwordHasher = new PasswordHasher()
  return new UpdateProfileUseCase(usersRepository, passwordHasher)
}
