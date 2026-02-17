import { FakeHasher } from '@python-editor/test/fakes/cryptography/fake-hasher'
import { Data } from '@python-editor/test/fakes/repositories/data'
import { FakeUsersRepository } from '@python-editor/test/fakes/repositories/fake-users-repository'
import { RegisterUserService } from './register-user-service'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'

let data: Data
let sut: RegisterUserService

let usersRepository: FakeUsersRepository
let hasher: FakeHasher

describe('Register user', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hasher = new FakeHasher()
    sut = new RegisterUserService(usersRepository, hasher)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to register a new user', async () => {
    const newUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: '123456',
    }

    await sut.execute(newUser)
  })

  it('should not be able to register if the email already exists', async () => {
    const newUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: '123456',
    }

    await sut.execute(newUser)

    await expect(() => sut.execute(newUser)).rejects.toBeInstanceOf(
      UserAlreadyExistsError,
    )
  })
})
