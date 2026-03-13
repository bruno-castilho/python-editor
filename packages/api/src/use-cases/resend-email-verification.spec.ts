import { ResendEmailVerificationUseCase } from './resend-email-verification'
import { EmailAlreadyVerifiedError } from './errors/email-already-verified-error'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakeHasher } from '../../test/cryptography/fake-hasher'
import { FakeToken } from '../../test/cryptography/fake-token'
import { FakeEmailVerificationTokenKeyValueStore } from '../../test/key-value-stores/fake-email-verification-token-key-value-store'
import { FakeSendEmailVerification } from '../../test/emails/fake-send-email-verification'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

let sut: ResendEmailVerificationUseCase

let data: Data
let usersRepository: FakeUsersRepository
let token: FakeToken
let hasher: FakeHasher
let emailVerificationTokenKeyValueStore: FakeEmailVerificationTokenKeyValueStore
let fakeSendEmailVerification: FakeSendEmailVerification

describe('Resend email verification', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hasher = new FakeHasher()
    token = new FakeToken()
    emailVerificationTokenKeyValueStore =
      new FakeEmailVerificationTokenKeyValueStore()
    fakeSendEmailVerification = new FakeSendEmailVerification()
    sut = new ResendEmailVerificationUseCase(
      usersRepository,
      token,
      hasher,
      emailVerificationTokenKeyValueStore,
      fakeSendEmailVerification,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should resend the verification email', async () => {
    await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed-password',
    })

    await sut.execute({ dto: { email: 'johndoe@example.com' } })

    expect(fakeSendEmailVerification.emailsSsent[0]).toEqual({
      email: 'johndoe@example.com',
      token: expect.any(String),
    })
  })

  it('should store the hashed token in the token store', async () => {
    await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed-password',
    })

    await sut.execute({ dto: { email: 'johndoe@example.com' } })

    expect(emailVerificationTokenKeyValueStore.store.size).toEqual(1)
  })

  it('should not be able to resend the verification email if the email is already verified', async () => {
    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed-password',
    })

    await usersRepository.markEmailAsVerified({ userId: user.id })

    await expect(() =>
      sut.execute({ dto: { email: 'johndoe@example.com' } }),
    ).rejects.toBeInstanceOf(EmailAlreadyVerifiedError)
  })

  it('should not be able to resend the verification email if the user not exits', async () => {
    await expect(() =>
      sut.execute({ dto: { email: 'johndoe@example.com' } }),
    ).rejects.toBeInstanceOf(UserDoesNotExistsError)
  })
})
