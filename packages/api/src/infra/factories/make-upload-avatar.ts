import db from '@python-editor/db'
import { AvatarStorage } from '../gateways/storages/storage'
import { UploadAvatarUseCase } from '../../domain/use-cases/upload-avatar'
import { env } from '@python-editor/env/server'
import { UsersRepository } from '../gateways/repositories/users-repository'

export function makeUploadAvatar() {
  const usersRepository = new UsersRepository(db.prisma)
  const avatarStorage = new AvatarStorage()
  return new UploadAvatarUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    usersRepository,
    avatarStorage,
  )
}
