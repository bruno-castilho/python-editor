import { RegisterUserUseCase } from './register-user'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakeHasher } from '../../test/cryptography/fake-hasher'
import { FakeToken } from '../../test/cryptography/fake-token'
import { FakeEmailVerificationTokenKeyValueStore } from '../../test/key-value-stores/fake-email-verification-token-key-value-store'
import { FakeSendEmailVerification } from '../../test/emails/fake-send-email-verification'

let sut: RegisterUserUseCase

let data: Data
let usersRepository: FakeUsersRepository
let hasher: FakeHasher
let token: FakeToken
let emailVerificationTokenKeyValueStore: FakeEmailVerificationTokenKeyValueStore
let fakeSendEmailVerification: FakeSendEmailVerification

describe('Register user', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hasher = new FakeHasher()
    token = new FakeToken()
    emailVerificationTokenKeyValueStore =
      new FakeEmailVerificationTokenKeyValueStore()
    fakeSendEmailVerification = new FakeSendEmailVerification()
    sut = new RegisterUserUseCase(
      usersRepository,
      hasher,
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

  it('should be able to register a new user', async () => {
    await sut.execute({
      dto: {
        name: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: '123456',
        repeatPassword: '123456',
      },
    })
  })

  it('should store the hashed token in the token store', async () => {
    await sut.execute({
      dto: {
        name: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: '123456',
        repeatPassword: '123456',
      },
    })

    expect(emailVerificationTokenKeyValueStore.store.size).toEqual(1)
  })

  it('should send a verification email after registration', async () => {
    await sut.execute({
      dto: {
        name: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: '123456',
        repeatPassword: '123456',
      },
    })

    expect(fakeSendEmailVerification.emailsSsent[0]).toEqual({
      email: 'johndoe@example.com',
      token: expect.any(String),
    })
  })

  it('should not be able to register if the email already exists', async () => {
    const newUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: '123456',
      repeatPassword: '123456',
    }

    await sut.execute({ dto: { ...newUser } })

    await expect(() =>
      sut.execute({ dto: { ...newUser } }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
