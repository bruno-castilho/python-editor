import { RemoveAvatarUseCase } from './remove-avatar'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'
import { FakeStorage } from '../../test/storage/fake-storage'

let data: Data
let usersRepository: FakeUsersRepository
let storage: FakeStorage
let sut: RemoveAvatarUseCase

describe('Remove Avatar Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    storage = new FakeStorage()
    sut = new RemoveAvatarUseCase(usersRepository, storage)
  })

  it('should be able to remove an avatar', async () => {
    const { fileId } = await storage.upload({
      body: Buffer.from('fake'),
      contentType: 'image/jpeg',
    })

    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed',
      avatar: fileId,
    })

    await sut.execute({ userId: user.id })

    const updatedUser = await usersRepository.findById({ userId: user.id })
    expect(updatedUser?.avatar).toBeNull()

    expect(storage.store.has(fileId)).toBe(false)
  })

  it('should not be able to remove an avatar for a non-existent user', async () => {
    await expect(
      sut.execute({ userId: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(UserDoesNotExistsError)
  })

  it('should not call storage delete when user has no avatar', async () => {
    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed',
    })

    await sut.execute({ userId: user.id })

    const updatedUser = await usersRepository.findById({ userId: user.id })

    expect(updatedUser?.avatar).toBeNull()
  })
})
