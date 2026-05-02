import db from '@python-editor/db'
import { UsersRepository } from '../../repositories/users-repository'
import { AvatarStorage } from '../../storages/storage'
import { RemoveAvatarUseCase } from '../remove-avatar'

export function makeRemoveAvatar() {
  const usersRepository = new UsersRepository(db.prisma)
  const avatarStorage = new AvatarStorage()
  return new RemoveAvatarUseCase(usersRepository, avatarStorage)
}
