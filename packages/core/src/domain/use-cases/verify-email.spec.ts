import { VerifyEmailUseCase } from './verify-email'
import { InvalidEmailVerificationTokenError } from '../errors/invalid-email-verification-token-error'
import { Data } from '../../../test/repositories/data'
import { FakeUsersRepository } from '../../../test/repositories/fake-users-repository'
import { FakeEmailVerificationTokenKeyValueStore } from '../../../test/key-value-stores/fake-email-verification-token-key-value-store'
import { FakeHashGenerator } from '../../../test/cryptography/fake-hash-generator'
import { FakeTokenGenerator } from '../../../test/cryptography/fake-token-generator'

let data: Data
let sut: VerifyEmailUseCase

let usersRepository: FakeUsersRepository
let hashGenerator: FakeHashGenerator
let emailVerificationTokenKeyValueStore: FakeEmailVerificationTokenKeyValueStore
let tokenGenerator: FakeTokenGenerator

describe('Verify email', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hashGenerator = new FakeHashGenerator()
    emailVerificationTokenKeyValueStore =
      new FakeEmailVerificationTokenKeyValueStore()
    sut = new VerifyEmailUseCase(
      usersRepository,
      hashGenerator,
      emailVerificationTokenKeyValueStore,
    )

    tokenGenerator = new FakeTokenGenerator()
  })

  it('should be able to verify the email', async () => {
    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed-password',
    })

    const rawToken = tokenGenerator.generate()
    const hashedToken = await hashGenerator.hash(rawToken)

    await emailVerificationTokenKeyValueStore.save({
      hashedToken,
      userId: user.id,
    })

    await sut.execute({ dto: { token: rawToken } })

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
      sut.execute({ dto: { token: 'nonexistent-token' } }),
    ).rejects.toBeInstanceOf(InvalidEmailVerificationTokenError)
  })
})
