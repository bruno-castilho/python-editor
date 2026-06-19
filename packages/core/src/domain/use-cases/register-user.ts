import type { RegisterUserDTO } from '@python-editor/schemas/register-user'
import type { ITokenGenerator } from '../interfaces/cryptography/token-generator'
import type { ISendEmailVerification } from '../interfaces/email/send-email-verification'
import type { IEmailVerificationTokenKeyValueStore } from '../interfaces/valkey/email-verification-token-key-value-store'
import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import type { IHashGenerator } from '../interfaces/cryptography/hash-generator'

interface RegisterUserUseCaseParams {
  dto: RegisterUserDTO
}

export class RegisterUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHashGenerator: IHashGenerator,
    private emailVerificationTokenGenerator: ITokenGenerator,
    private emailVerificationTokenHashGenerator: IHashGenerator,
    private emailVerificationTokenKeyValueStore: IEmailVerificationTokenKeyValueStore,
    private sendEmailVerification: ISendEmailVerification,
  ) {}

  async execute({ dto }: RegisterUserUseCaseParams) {
    const { email } = dto

    const userExists = await this.checkIfEmailAlreadyExists(email)
    if (userExists) {
      throw new UserAlreadyExistsError()
    }

    const user = await this.createUserWithEncryptedPassword(dto)

    const token = this.emailVerificationTokenGenerator.generate()

    await this.saveEncryptedEmailVerificationTokenGenerator({
      userId: user.id,
      token,
    })

    await this.sendEmailVerification.send({ email, token })
  }

  private async checkIfEmailAlreadyExists(email: string) {
    const userWithSameEmail = await this.usersRepository.findByEmail({ email })
    return userWithSameEmail !== null
  }

  private async createUserWithEncryptedPassword(params: {
    name: string
    lastName: string
    email: string
    password: string
  }) {
    const { name, lastName, email, password } = params
    const hashedPassword = await this.passwordHashGenerator.hash(password)
    return this.usersRepository.create({
      name,
      lastName,
      email,
      hashedPassword,
    })
  }

  private async saveEncryptedEmailVerificationTokenGenerator(params: {
    userId: string
    token: string
  }) {
    const { userId, token } = params
    const hashedToken =
      await this.emailVerificationTokenHashGenerator.hash(token)
    return await this.emailVerificationTokenKeyValueStore.save({
      hashedToken,
      userId,
    })
  }
}
