import { UsersRepository } from '../../repositories/users-repository'
import { GetProfileUseCase } from '../get-profile'

export function makeGetProfileUseCase() {
  const usersRepository = new UsersRepository()
  return new GetProfileUseCase(usersRepository)
}
