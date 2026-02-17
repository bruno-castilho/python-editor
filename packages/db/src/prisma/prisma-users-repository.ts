import prisma from '..'
import type { UsersRepository } from '../interfaces/users-repository'
import type { UserCreateParams } from '../types/user'
import { v7 as uuidv7 } from 'uuid'

export class PrismaUsersRepository implements UsersRepository {
  async create(params: UserCreateParams) {
    const { name, lastName, email, hashedPassword, createdAt } = params

    return await prisma.user.create({
      omit: { hashedPassword: true },
      data: {
        id: uuidv7(),
        name,
        lastName,
        email,
        hashedPassword,
        createdAt,
      },
    })
  }

  async findByEmail(params: { email: string }) {
    const { email } = params
    return prisma.user.findUnique({
      omit: {
        hashedPassword: true,
      },
      where: {
        email,
      },
    })
  }
}
