import { AvatarStorage } from '../gateways/storages/storage'
import { DownloadAvatarUseCase } from '../../domain/use-cases/download-avatar'

export function makeDownloadAvatarUseCase() {
  const avatarStorage = new AvatarStorage()
  return new DownloadAvatarUseCase(avatarStorage)
}
