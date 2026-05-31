import db from '@python-editor/db'
import { UsersRepository } from '../../repositories/users-repository'
import { AvatarStorage } from '../../storages/storage'
import { UploadAvatarUseCase } from '../upload-avatar'
import { env } from '@python-editor/env/server'

export function makeUploadAvatar() {
  const usersRepository = new UsersRepository(db.prisma)
  const avatarStorage = new AvatarStorage()
  return new UploadAvatarUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    usersRepository,
    avatarStorage,
  )
}
