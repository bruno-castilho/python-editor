import type { Prisma, User as UserPrisma } from '@python-editor/db'

export type User = UserPrisma

export type UserWithoutPassword = Omit<User, 'hashedPassword'>

export type UserCreateParams = Omit<Prisma.UserCreateInput, 'id'> & {
  id?: Prisma.UserCreateInput['id']
}
