import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import { UserDoesNotExistsError } from '../errors/user-does-not-exists-error'

interface GetProfileParams {
  userId: string
}

export class GetProfileUseCase {
  constructor(
    private avatarDownloadBaseUrl: string,
    private usersRepository: IUsersRepository,
  ) {}

  async execute(params: GetProfileParams) {
    const { userId } = params

    const user = await this.usersRepository.findById({ userId })

    if (!user) {
      throw new UserDoesNotExistsError()
    }

    const avatarUrl = user.avatar
      ? `${this.avatarDownloadBaseUrl}/${user.avatar}`
      : null

    return { user: { ...user, avatarUrl } }
  }
}
