import type { Hasher } from '@python-editor/cryptography/interfaces/hasher'
import type { UsersRepository } from '@python-editor/db/interfaces/users-repository'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'

interface RegisterUserParams {
  name: string
  lastName: string
  email: string
  password: string
}

export class RegisterUserService {
  constructor(
    private usersRepository: UsersRepository,
    private passwordHasher: Hasher,
  ) {}

  async execute(params: RegisterUserParams) {
    const { email } = params

    const userExists = await this.checkIfEmailAlreadyExists(email)
    if (userExists) {
      throw new UserAlreadyExistsError()
    }

    await this.createUserWithEncryptedPassword(params)
  }

  private async checkIfEmailAlreadyExists(email: string) {
    const userWithSameEmail = await this.usersRepository.findByEmail({
      email,
    })
    return userWithSameEmail !== null
  }

  private async createUserWithEncryptedPassword(params: RegisterUserParams) {
    const { name, lastName, email, password } = params
    const hashedPassword = await this.passwordHasher.hash(password)
    await this.usersRepository.create({
      name,
      lastName,
      email,
      hashedPassword,
    })
  }
}
