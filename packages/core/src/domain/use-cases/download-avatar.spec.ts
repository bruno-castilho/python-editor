import { beforeEach, describe, expect, it } from 'vitest'
import { FakeStorage } from '../../../test/storage/fake-storage'
import { DownloadAvatarUseCase } from './download-avatar'

const MOCK_AVATAR_CONTENT = Buffer.from('fake-image-bytes')

let avatarStorage: FakeStorage
let sut: DownloadAvatarUseCase

describe('Download Avatar Use Case', () => {
  beforeEach(() => {
    avatarStorage = new FakeStorage()
    sut = new DownloadAvatarUseCase(avatarStorage)
  })

  it('should be able to download an avatar by fileId', async () => {
    const { fileId } = await avatarStorage.upload({
      body: MOCK_AVATAR_CONTENT,
      contentType: 'image/jpeg',
    })

    const { avatarData, contentType } = await sut.execute({
      dto: { fileId },
    })

    expect(avatarData).toBeInstanceOf(Buffer)
    expect(avatarData).toEqual(MOCK_AVATAR_CONTENT)
    expect(contentType).toBe('image/jpeg')
  })
})
