import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { LoginService } from './login'
import { Data } from '@python-editor/test/fakes/repositories/data'
import { FakeUsersRepository } from '@python-editor/test/fakes/repositories/fake-users-repository'
import { FakeJWT } from '@python-editor/test/fakes/cryptography/fake-jwt'
import { FakeHasher } from '@python-editor/test/fakes/cryptography/fake-hasher'

let data: Data
let usersRepository: FakeUsersRepository
let sut: LoginService
let accessToken: FakeJWT
let refreshToken: FakeJWT
let hasher: FakeHasher

describe('Login Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    accessToken = new FakeJWT()
    refreshToken = new FakeJWT()
    hasher = new FakeHasher()
    sut = new LoginService(usersRepository, accessToken, refreshToken, hasher)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to do login', async () => {
    const hashedPassword = await hasher.hash('123456')

    await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    const { user, accessToken, refreshToken } = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(accessToken).toEqual(expect.any(String))
    expect(refreshToken).toEqual(expect.any(String))
    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to do login with wrong email', async () => {
    await expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to do login with wrong password', async () => {
    const hashedPassword = await hasher.hash('123456')

    await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    await expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
