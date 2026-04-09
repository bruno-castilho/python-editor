import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'
import type { IStorage } from '../storages/interfaces/storage'

interface UploadAvatarParams {
  userId: string
  fileBuffer: Buffer
  contentType: string
}

export class UploadAvatarUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private avatarStorage: IStorage,
    private storagePublicUrl: string,
  ) {}

  async execute(params: UploadAvatarParams) {
    const { userId, fileBuffer, contentType } = params

    const user = await this.usersRepository.findById({ userId })

    if (!user) {
      throw new UserDoesNotExistsError()
    }

    if (user.avatar) {
      await this.avatarStorage.delete({ fileId: user.avatar })
    }

    const { fileId } = await this.avatarStorage.upload({
      body: fileBuffer,
      contentType,
    })

    await this.usersRepository.updateAvatar({ userId, avatar: fileId })

    return { avatarUrl: `${this.storagePublicUrl}/${fileId}` }
  }
}
