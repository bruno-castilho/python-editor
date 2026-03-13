import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

interface GetProfileParams {
  userId: string
}

export class GetProfileUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(params: GetProfileParams) {
    const { userId } = params

    const user = await this.usersRepository.findById({ userId })

    if (!user) {
      throw new UserDoesNotExistsError()
    }

    return { user }
  }
}
