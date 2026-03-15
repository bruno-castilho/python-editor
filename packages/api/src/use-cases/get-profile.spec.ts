import { GetProfileUseCase } from './get-profile'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

let data: Data
let usersRepository: FakeUsersRepository
let sut: GetProfileUseCase

describe('Get Profile Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    sut = new GetProfileUseCase(usersRepository)
  })

  it('should be able to get the profile', async () => {
    const created = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: '123456',
    })

    const { user } = await sut.execute({ userId: created.id })

    expect(user.id).toEqual(created.id)
    expect(user.name).toEqual('John')
    expect(user.email).toEqual('johndoe@example.com')
  })

  it('should not be able to get the profile if user does not exist', async () => {
    await expect(() =>
      sut.execute({ userId: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(UserDoesNotExistsError)
  })
})
