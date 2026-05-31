import db from '@python-editor/db'
import { UsersRepository } from '../../repositories/users-repository'
import { GetProfileUseCase } from '../get-profile'
import { env } from '@python-editor/env/server'

export function makeGetProfileUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  return new GetProfileUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    usersRepository,
  )
}
