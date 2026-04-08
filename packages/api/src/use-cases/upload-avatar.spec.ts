import { Readable } from 'node:stream'
import { UploadAvatarUseCase } from './upload-avatar'
import { Data } from '../../test/repositories/data'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { FakeStorage } from '../../test/storage/fake-storage'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

let data: Data
let usersRepository: FakeUsersRepository
let storage: FakeStorage
let sut: UploadAvatarUseCase

const fakeFileStream = () => Readable.from(Buffer.from('fake-image-data'))
const fakeFileContentType = 'image/jpeg'

describe('Upload Avatar Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    storage = new FakeStorage()
    sut = new UploadAvatarUseCase(
      usersRepository,
      storage,
      'https://fake-storage.test/',
    )
  })

  it('should be able to upload an avatar', async () => {
    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed',
    })

    const { avatarUrl } = await sut.execute({
      userId: user.id,
      fileStream: fakeFileStream(),
      contentType: fakeFileContentType,
    })

    expect(avatarUrl).toMatch(/^https:\/\/fake-storage\.test\/.+/)

    const updatedUser = await usersRepository.findById({ userId: user.id })
    expect(updatedUser?.avatar).not.toBeNull()
  })

  it('should not be able to upload an avatar for a non-existent user', async () => {
    await expect(
      sut.execute({
        userId: 'non-existent-id',
        fileStream: fakeFileStream(),
        contentType: fakeFileContentType,
      }),
    ).rejects.toBeInstanceOf(UserDoesNotExistsError)
  })

  it('should not be able to upload a new avatar without deleting the previous one', async () => {
    const { fileId } = await storage.upload({
      body: fakeFileStream(),
      contentType: fakeFileContentType,
    })

    const user = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      hashedPassword: 'hashed',
      avatar: fileId,
    })

    await sut.execute({
      userId: user.id,
      fileStream: fakeFileStream(),
      contentType: fakeFileContentType,
    })

    expect(storage.store.has(fileId)).toBe(false)
  })
})
