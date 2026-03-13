import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import type { IHasher } from '../cryptography/interfaces/hasher'
import type { UpdateUserDTO } from '@python-editor/schemas/update-user'
import { UserNotFoundError } from './errors/user-not-found-error'
import { InvalidCurrentPasswordError } from './errors/invalid-current-password-error'

interface UpdateProfileParams {
  dto: UpdateUserDTO
  userId: string
}

export class UpdateProfileUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHasher: IHasher,
  ) {}

  async execute({ dto, userId }: UpdateProfileParams): Promise<void> {
    const { name, lastName, password, newPassword } = dto

    const user = await this.usersRepository.findByIdWithPassword({ userId })

    if (!user) {
      throw new UserNotFoundError()
    }

    const passwordMatches = await this.passwordHasher.compare(
      password,
      user.hashedPassword,
    )

    if (!passwordMatches) {
      throw new InvalidCurrentPasswordError()
    }

    let hashedPassword: string | undefined

    if (newPassword) {
      hashedPassword = await this.passwordHasher.hash(newPassword)
    }

    await this.usersRepository.update({
      userId,
      name,
      lastName,
      hashedPassword,
    })
  }
}
