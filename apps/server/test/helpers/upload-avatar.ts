import { UsersRepository } from '@python-editor/core/infra/gateways/repositories/users-repository'
import { AvatarStorage } from '@python-editor/core/infra/gateways/storages/storage'
import db from '@python-editor/db'

export async function assignUserAvatar(params: { userId: string }) {
  const { userId } = params

  const avatarStorage = new AvatarStorage()
  const usersRepository = new UsersRepository(db.prisma)

  const fileBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  )
  const { fileId } = await avatarStorage.upload({
    body: fileBuffer,
    contentType: 'image/jpeg',
  })

  await usersRepository.updateAvatar({ userId, avatar: fileId })

  return { fileId, contentType: 'image/jpeg', fileBuffer }
}
