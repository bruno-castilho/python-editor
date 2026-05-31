import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import type { IStorage } from '../storages/interfaces/storage'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

interface UploadAvatarParams {
  userId: string
  fileBuffer: Buffer
  contentType: string
}

export class UploadAvatarUseCase {
  constructor(
    private avatarDownloadBaseUrl: string,
    private usersRepository: IUsersRepository,
    private avatarStorage: IStorage,
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

    return { avatarUrl: `${this.avatarDownloadBaseUrl}/${fileId}` }
  }
}
