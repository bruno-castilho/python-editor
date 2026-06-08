import db from '@python-editor/db'
import { GetProfileUseCase } from '../../domain/use-cases/get-profile'
import { env } from '@python-editor/env/server'
import { UsersRepository } from '../gateways/repositories/users-repository'

export function makeGetProfileUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  return new GetProfileUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    usersRepository,
  )
}
