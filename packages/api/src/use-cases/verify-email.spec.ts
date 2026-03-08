import { VerifyEmailUseCase } from './verify-email'
import { InvalidEmailVerificationTokenError } from './errors/invalid-email-verification-token-error'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakeEmailVerificationTokenKeyValueStore } from '../../test/key-value-stores/fake-email-verification-token-key-value-store'
import { FakeHasher } from '../../test/cryptography/fake-hasher'
import { FakeToken } from '../../test/cryptography/fake-token'

let data: Data
let sut: VerifyEmailUseCase

let usersRepository: FakeUsersRepository
let hasher: FakeHasher
let emailVerificationTokenKeyValueStore: FakeEmailVerificationTokenKeyValueStore
let token: FakeToken

describe('Verify email', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hasher = new FakeHasher()
    emailVerificationTokenKeyValueStore =
      new FakeEmailVerificationTokenKeyValueStore()
    sut = new VerifyEmailUseCase(
      usersRepository,
      hasher,
      emailVerificationTokenKeyValueStore,
    )

    token = new FakeToken()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to verify the email', async () => {
    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed-password',
    })

    const rawToken = token.generate()
    const hashedToken = await hasher.hash(rawToken)

    await emailVerificationTokenKeyValueStore.save({
      hashedToken,
      userId: user.id,
    })

    await sut.execute({ token: rawToken })

    const updatedUser = await usersRepository.findByEmail({
      email: 'johndoe@example.com',
    })

    expect(updatedUser?.emailVerified).toBe(true)
    const userId = await emailVerificationTokenKeyValueStore.findUserIdByToken({
      hashedToken,
    })
    expect(userId).toBeNull()
  })

  it('should not be able to verify the email if de token not exists', async () => {
    await expect(() =>
      sut.execute({ token: 'nonexistent-token' }),
    ).rejects.toBeInstanceOf(InvalidEmailVerificationTokenError)
  })
})
