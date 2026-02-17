import type { Prisma, User as UserPrisma } from '../../prisma/generated/client'

export type User = UserPrisma

export type UserWithoutPassword = Omit<User, 'hashedPassword'>

export type UserCreateParams = Omit<Prisma.UserCreateInput, 'id'>
