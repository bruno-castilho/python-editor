import { UpdateProfileUseCase } from './update-profile'
import { InvalidCurrentPasswordError } from '../errors/invalid-current-password-error'
import { Data } from '../../../test/repositories/data'
import { FakeUsersRepository } from '../../../test/repositories/fake-users-repository'
import { UserDoesNotExistsError } from '../errors/user-does-not-exists-error'
import { FakeHashGenerator } from '../../../test/cryptography/fake-hash-generator'
import { FakeHashCompare } from '../../../test/cryptography/fake-hash-compare'

let data: Data
let usersRepository: FakeUsersRepository
let hashCompare: FakeHashCompare
let hashGenerator: FakeHashGenerator
let sut: UpdateProfileUseCase

describe('Update Profile Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    hashCompare = new FakeHashCompare()
    hashGenerator = new FakeHashGenerator()
    sut = new UpdateProfileUseCase(usersRepository, hashCompare, hashGenerator)
  })

  it('should be able to update name, lastName and email', async () => {
    const hashedPassword = await hashGenerator.hash('Senha@123')

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
    const hashedPassword = await hashGenerator.hash('Senha@123')

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
      hashCompare.compare('NovaSenha@456', user?.hashedPassword ?? ''),
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
    const hashedPassword = await hashGenerator.hash('Senha@123')

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
