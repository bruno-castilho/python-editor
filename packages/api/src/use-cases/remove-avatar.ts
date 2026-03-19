import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import type { IStorage } from '../storages/interfaces/storage'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

interface RemoveAvatarParams {
  userId: string
}

export class RemoveAvatarUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private avatarStorage: IStorage,
  ) {}

  async execute(params: RemoveAvatarParams) {
    const { userId } = params

    const user = await this.usersRepository.findById({ userId })

    if (!user) {
      throw new UserDoesNotExistsError()
    }

    if (user.avatar) {
      await this.avatarStorage.delete({ fileId: user.avatar })
    }

    await this.usersRepository.updateAvatar({ userId, avatar: null })
  }
}
