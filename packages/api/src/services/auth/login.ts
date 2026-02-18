import type { UsersRepository } from '@python-editor/db/interfaces/users-repository'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import type { JWT } from '@python-editor/cryptography/interfaces/jwt'
import type { Hasher } from '@python-editor/cryptography/interfaces/hasher'
import type { LoginDTO } from '@python-editor/schemas/login'

export class LoginService {
  constructor(
    private usersRepository: UsersRepository,
    private accessToken: JWT,
    private refreshToken: JWT,
    private passwordHasher: Hasher,
  ) {}

  async execute(params: LoginDTO) {
    const { email, password } = params

    const user = await this.usersRepository.findByEmailWithPassword({
      email,
    })

    if (!user) throw new InvalidCredentialsError()

    const { hashedPassword, ...userWithoutPassword } = user

    const doesPasswordMatches = await this.passwordHasher.compare(
      password,
      hashedPassword ?? '',
    )

    if (!doesPasswordMatches) throw new InvalidCredentialsError()

    const payload = { userId: user.id }

    const accessToken = this.accessToken.sign(payload)
    const refreshToken = this.refreshToken.sign(payload)

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    }
  }
}
