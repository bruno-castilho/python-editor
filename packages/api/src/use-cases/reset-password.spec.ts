import { ResetPasswordUseCase } from './reset-password'
import { InvalidPasswordResetTokenError } from './errors/invalid-password-reset-token-error'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakeHasher } from '../../test/cryptography/fake-hasher'
import { FakeToken } from '../../test/cryptography/fake-token'
import { FakePasswordResetTokenKeyValueStore } from '../../test/key-value-stores/fake-password-reset-token-key-value-store'

let data: Data
let sut: ResetPasswordUseCase
let usersRepository: FakeUsersRepository
let passwordHasher: FakeHasher
let tokenHasher: FakeHasher
let token: FakeToken
let passwordResetTokenKeyValueStore: FakePasswordResetTokenKeyValueStore

describe('Reset password', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    passwordHasher = new FakeHasher()
    tokenHasher = new FakeHasher()
    token = new FakeToken()
    passwordResetTokenKeyValueStore = new FakePasswordResetTokenKeyValueStore()
    sut = new ResetPasswordUseCase(
      usersRepository,
      passwordHasher,
      tokenHasher,
      passwordResetTokenKeyValueStore,
    )
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to reset the password', async () => {
    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'old-hashed-password',
    })

    const rawToken = token.generate()
    const hashedToken = await tokenHasher.hash(rawToken)
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
