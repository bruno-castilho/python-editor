import { UsersRepository } from '../../repositories/users-repository'
import { AvatarStorage } from '../../storages/storage'
import { UploadAvatarUseCase } from '../upload-avatar'
import { env } from '@python-editor/env/server'

export function makeUploadAvatar() {
  const usersRepository = new UsersRepository()
  const avatarStorage = new AvatarStorage()
  const storagePublicUrl = env.STORAGE_PUBLIC_URL
  return new UploadAvatarUseCase(
    usersRepository,
    avatarStorage,
    storagePublicUrl,
  )
}
