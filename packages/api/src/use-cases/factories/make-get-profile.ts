import db from '@python-editor/db'
import { UsersRepository } from '../../repositories/users-repository'
import { GetProfileUseCase } from '../get-profile'

export function makeGetProfileUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  return new GetProfileUseCase(usersRepository)
}
