import db from '@python-editor/db'
import { AvatarStorage } from '../gateways/storages/storage'
import { RemoveAvatarUseCase } from '../../domain/use-cases/remove-avatar'
import { UsersRepository } from '../gateways/repositories/users-repository'

export function makeRemoveAvatar() {
  const usersRepository = new UsersRepository(db.prisma)
  const avatarStorage = new AvatarStorage()
  return new RemoveAvatarUseCase(usersRepository, avatarStorage)
}
