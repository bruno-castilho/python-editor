import { AvatarStorage } from '../../storages/storage'
import { DownloadAvatarUseCase } from '../download-avatar'

export function makeDownloadAvatarUseCase() {
  const avatarStorage = new AvatarStorage()
  return new DownloadAvatarUseCase(avatarStorage)
}
