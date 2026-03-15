import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { EmailNotVerifiedError } from './errors/email-not-verified-error'
import { SignInUseCase } from './sign-in'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakeJWTSign } from '../../test/cryptography/fake-jwt-sign'
import { FakeHashCompare } from '../../test/cryptography/fake-hash-compare'
import { FakeHashGenerator } from '../../test/cryptography/fake-hash-generator'

let data: Data
let usersRepository: FakeUsersRepository
let sut: SignInUseCase
let jwtSign: FakeJWTSign
let hashCompare: FakeHashCompare
let hashGenerator: FakeHashGenerator

describe('Sign In Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    jwtSign = new FakeJWTSign()
    hashCompare = new FakeHashCompare()
    sut = new SignInUseCase(usersRepository, jwtSign, jwtSign, hashCompare)

    hashGenerator = new FakeHashGenerator()
  })

  it('should be able to do sign in with a verified email', async () => {
    const hashedPassword = await hashGenerator.hash('123456')

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
    const hashedPassword = await hashGenerator.hash('123456')

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
    const hashedPassword = await hashGenerator.hash('123456')

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
