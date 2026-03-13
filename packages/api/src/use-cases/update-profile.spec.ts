import { UpdateProfileUseCase } from './update-profile'
import { InvalidCurrentPasswordError } from './errors/invalid-current-password-error'
import { FakeHasher } from '../../test/cryptography/fake-hasher'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

let data: Data
let usersRepository: FakeUsersRepository
let hasher: FakeHasher
let sut: UpdateProfileUseCase

describe('Update Profile Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hasher = new FakeHasher()
    sut = new UpdateProfileUseCase(usersRepository, hasher)
  })

  it('should be able to update name, lastName and email', async () => {
    const hashedPassword = await hasher.hash('Senha@123')

    const created = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    await sut.execute({
      userId: created.id,
      dto: {
        name: 'Jane',
        lastName: 'Smith',
        password: 'Senha@123',
      },
    })

    const user = await usersRepository.findByIdWithPassword({
      userId: created.id,
    })

    expect(user?.name).toEqual('Jane')
    expect(user?.lastName).toEqual('Smith')
  })

  it('should be able to update the password when newPassword is provided', async () => {
    const hashedPassword = await hasher.hash('Senha@123')

    const created = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    await sut.execute({
      userId: created.id,
      dto: {
        name: 'John',
        lastName: 'Doe',
        password: 'Senha@123',
        newPassword: 'NovaSenha@456',
        repeatPassword: 'NovaSenha@456',
      },
    })

    const user = await usersRepository.findByIdWithPassword({
      userId: created.id,
    })

    await expect(
      hasher.compare('NovaSenha@456', user?.hashedPassword ?? ''),
    ).resolves.toEqual(true)
  })

  it('should not be able to update profile if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 'non-existent-id',
        dto: { name: 'John', lastName: 'Doe', password: 'Senha@123' },
      }),
    ).rejects.toBeInstanceOf(UserDoesNotExistsError)
  })

  it('should not be able to update profile with wrong current password', async () => {
    const hashedPassword = await hasher.hash('Senha@123')

    const created = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword,
    })

    await expect(() =>
      sut.execute({
        userId: created.id,
        dto: { name: 'John', lastName: 'Doe', password: 'SenhaErrada@123' },
      }),
    ).rejects.toBeInstanceOf(InvalidCurrentPasswordError)
  })
})
