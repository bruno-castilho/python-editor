import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { EmailNotVerifiedError } from './errors/email-not-verified-error'
import { SignInUseCase } from './sign-in'
import { FakeJWT } from '../../test/cryptography/fake-jwt'
import { FakeHasher } from '../../test/cryptography/fake-hasher'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'

let data: Data
let usersRepository: FakeUsersRepository
let sut: SignInUseCase
let accessToken: FakeJWT
let refreshToken: FakeJWT
let hasher: FakeHasher

describe('Sign In Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    accessToken = new FakeJWT()
    refreshToken = new FakeJWT()
    hasher = new FakeHasher()
    sut = new SignInUseCase(usersRepository, accessToken, refreshToken, hasher)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to do sign in with a verified email', async () => {
    const hashedPassword = await hasher.hash('123456')

    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    await usersRepository.markEmailAsVerified({ userId: user.id })

    const { accessToken, refreshToken } = await sut.execute({
      dto: {
        email: 'johndoe@example.com',
        password: '123456',
      },
    })

    expect(accessToken).toEqual(expect.any(String))
    expect(refreshToken).toEqual(expect.any(String))
  })

  it('should not be able to do sign in with an unverified email', async () => {
    const hashedPassword = await hasher.hash('123456')

    await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    await expect(() =>
      sut.execute({
        dto: {
          email: 'johndoe@example.com',
          password: '123456',
        },
      }),
    ).rejects.toBeInstanceOf(EmailNotVerifiedError)
  })

  it('should not be able to do sign in with wrong email', async () => {
    await expect(() =>
      sut.execute({
        dto: {
          email: 'johndoe@example.com',
          password: '123456',
        },
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to do sign in with wrong password', async () => {
    const hashedPassword = await hasher.hash('123456')

    await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    await expect(() =>
      sut.execute({
        dto: {
          email: 'johndoe@example.com',
          password: '123123',
        },
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
