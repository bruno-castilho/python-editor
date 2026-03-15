import { ResetPasswordUseCase } from './reset-password'
import { InvalidPasswordResetTokenError } from './errors/invalid-password-reset-token-error'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakePasswordResetTokenKeyValueStore } from '../../test/key-value-stores/fake-password-reset-token-key-value-store'
import { FakeHashGenerator } from '../../test/cryptography/fake-hash-generator'
import { FakeTokenGenerator } from '../../test/cryptography/fake-token-generator'

let data: Data
let sut: ResetPasswordUseCase
let usersRepository: FakeUsersRepository
let hashGenerator: FakeHashGenerator
let tokenGenerator: FakeTokenGenerator
let passwordResetTokenKeyValueStore: FakePasswordResetTokenKeyValueStore

describe('Reset password', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hashGenerator = new FakeHashGenerator()
    tokenGenerator = new FakeTokenGenerator()
    passwordResetTokenKeyValueStore = new FakePasswordResetTokenKeyValueStore()
    sut = new ResetPasswordUseCase(
      usersRepository,
      hashGenerator,
      hashGenerator,
      passwordResetTokenKeyValueStore,
    )
  })

  it('should be able to reset the password', async () => {
    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'old-hashed-password',
    })

    const rawToken = tokenGenerator.generate()
    const hashedToken = await hashGenerator.hash(rawToken)
    await passwordResetTokenKeyValueStore.save({ hashedToken, userId: user.id })

    await sut.execute({
      dto: {
        token: rawToken,
        password: 'NewPassword1!',
        repeatPassword: 'NewPassword1!',
      },
    })

    const updatedUser = await usersRepository.findByEmailWithPassword({
      email: 'johndoe@example.com',
    })

    expect(updatedUser?.hashedPassword).toBe('NewPassword1!')
    expect(passwordResetTokenKeyValueStore.store.size).toBe(0)
  })

  it('should not be able to reset the password with a nonexistent token', async () => {
    await expect(() =>
      sut.execute({
        dto: {
          token: 'invalid-token',
          password: 'NewPassword1!',
          repeatPassword: 'NewPassword1!',
        },
      }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError)
  })
})
