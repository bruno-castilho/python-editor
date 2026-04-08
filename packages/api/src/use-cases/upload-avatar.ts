import type { Readable } from 'node:stream'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'
import type { IStorage } from '../storages/interfaces/storage'

interface UploadAvatarParams {
  userId: string
  fileStream: Readable
  contentType: string
  onProgress?: (progress: { loaded: number; total?: number }) => void
}

export class UploadAvatarUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private avatarStorage: IStorage,
    private storagePublicUrl: string,
  ) {}

  async execute(params: UploadAvatarParams) {
    const { userId, fileStream, contentType, onProgress } = params

    const user = await this.usersRepository.findById({ userId })

    if (!user) {
      throw new UserDoesNotExistsError()
    }

    if (user.avatar) {
      await this.avatarStorage.delete({ fileId: user.avatar })
    }

    const { fileId } = await this.avatarStorage.upload({
      body: fileStream,
      contentType,
      onProgress,
    })

    await this.usersRepository.updateAvatar({ userId, avatar: fileId })

    return { avatarUrl: `${this.storagePublicUrl}/${fileId}` }
  }
}
