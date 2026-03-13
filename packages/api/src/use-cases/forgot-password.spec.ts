import { ForgotPasswordUseCase } from './forgot-password'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakeHasher } from '../../test/cryptography/fake-hasher'
import { FakeToken } from '../../test/cryptography/fake-token'
import { FakePasswordResetTokenKeyValueStore } from '../../test/key-value-stores/fake-password-reset-token-key-value-store'
import { FakeSendPasswordReset } from '../../test/emails/fake-send-password-reset'

let data: Data
let sut: ForgotPasswordUseCase
let usersRepository: FakeUsersRepository
let hasher: FakeHasher
let token: FakeToken
let passwordResetTokenKeyValueStore: FakePasswordResetTokenKeyValueStore
let sendPasswordReset: FakeSendPasswordReset

describe('Forgot password', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hasher = new FakeHasher()
    token = new FakeToken()
    passwordResetTokenKeyValueStore = new FakePasswordResetTokenKeyValueStore()
    sendPasswordReset = new FakeSendPasswordReset()
    sut = new ForgotPasswordUseCase(
      usersRepository,
      token,
      hasher,
      passwordResetTokenKeyValueStore,
      sendPasswordReset,
    )
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Should be able to send a password reset email.', async () => {
    usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed-password',
    })

    await sut.execute({ dto: { email: 'johndoe@example.com' } })

    expect(passwordResetTokenKeyValueStore.store.size).toBe(1)
    expect(sendPasswordReset.emailsSent).toHaveLength(1)
    expect(sendPasswordReset.emailsSent[0]).toEqual({
      email: 'johndoe@example.com',
      token: expect.any(String),
    })
  })

  it('should not be able to send a password reset email when user does not exist', async () => {
    await sut.execute({ dto: { email: 'nonexistent@example.com' } })

    expect(sendPasswordReset.emailsSent).toHaveLength(0)
    expect(passwordResetTokenKeyValueStore.store.size).toBe(0)
  })
})
