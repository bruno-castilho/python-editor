import type { RegisterUserDTO } from '@python-editor/schemas/register-user'
import type { IHasher } from '../cryptography/interfaces/hasher'
import type { IToken } from '../cryptography/interfaces/token'
import type { ISendEmailVerification } from '../emails/interfaces/send-email-verification'
import type { IEmailVerificationTokenKeyValueStore } from '../key-value-stores/interfaces/email-verification-token-key-value-store'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

export class RegisterUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHasher: IHasher,
    private emailVerificationToken: IToken,
    private emailVerificationTokenHasher: IHasher,
    private emailVerificationTokenKeyValueStore: IEmailVerificationTokenKeyValueStore,
    private sendEmailVerification: ISendEmailVerification,
  ) {}

  async execute(params: RegisterUserDTO) {
    const { email } = params

    const userExists = await this.checkIfEmailAlreadyExists(email)
    if (userExists) {
      throw new UserAlreadyExistsError()
    }

    const user = await this.createUserWithEncryptedPassword(params)

    const token = this.emailVerificationToken.generate()

    await this.saveEncryptedVerificationToken({ userId: user.id, token })

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
    const hashedPassword = await this.passwordHasher.hash(password)
    return this.usersRepository.create({
      name,
      lastName,
      email,
      hashedPassword,
    })
  }

  private async saveEncryptedVerificationToken(params: {
    userId: string
    token: string
  }) {
    const { userId, token } = params
    const hashedToken = await this.emailVerificationTokenHasher.hash(token)
    return await this.emailVerificationTokenKeyValueStore.save({
      hashedToken,
      userId,
    })
  }
}
