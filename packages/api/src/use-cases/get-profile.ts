import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { UserNotFoundError } from './errors/user-not-found-error'

interface GetProfileParams {
  userId: string
}

export class GetProfileUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(params: GetProfileParams) {
    const { userId } = params

    const user = await this.usersRepository.findById({ userId })

    if (!user) {
      throw new UserNotFoundError()
    }

    return { user }
  }
}
