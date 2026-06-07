import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import type { UpdateUserDTO } from '@python-editor/schemas/update-user'
import { InvalidCurrentPasswordError } from '../errors/invalid-current-password-error'
import { UserDoesNotExistsError } from '../errors/user-does-not-exists-error'
import type { IHashGenerator } from '../interfaces/cryptography/hash-generator'
import type { IHashCompare } from '../interfaces/cryptography/hash-compare'

interface UpdateProfileParams {
  dto: UpdateUserDTO
  userId: string
}

export class UpdateProfileUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHashCompare: IHashCompare,
    private passwordHashGenerator: IHashGenerator,
  ) {}

  async execute({ dto, userId }: UpdateProfileParams): Promise<void> {
    const { name, lastName, password, newPassword } = dto

    const user = await this.usersRepository.findByIdWithPassword({ userId })

    if (!user) {
      throw new UserDoesNotExistsError()
    }

    const passwordMatches = await this.passwordHashCompare.compare(
      password,
      user.hashedPassword,
    )

    if (!passwordMatches) {
      throw new InvalidCurrentPasswordError()
    }

    let hashedPassword: string | undefined

    if (newPassword) {
      hashedPassword = await this.passwordHashGenerator.hash(newPassword)
    }

    await this.usersRepository.update({
      userId,
      name,
      lastName,
      hashedPassword,
    })
  }
}
