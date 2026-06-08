import { v7 as uuidv7 } from 'uuid'
import type { PrismaClient } from '@python-editor/db'
import type { IUsersRepository } from '../../../domain/interfaces/repositories/users-repository'
import type { UserCreateParams } from '../../../domain/types/user'

export class UsersRepository implements IUsersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(params: UserCreateParams) {
    const {
      name,
      lastName,
      email,
      hashedPassword,
      createdAt,
      id,
      emailVerified,
    } = params

    return await this.prisma.user.create({
      omit: { hashedPassword: true },
      data: {
        id: id || uuidv7(),
        name,
        lastName,
        email,
        hashedPassword,
        createdAt,
        emailVerified,
      },
    })
  }

  async findByEmail(params: { email: string }) {
    const { email } = params
    return this.prisma.user.findUnique({
      omit: {
        hashedPassword: true,
      },
      where: {
        email,
      },
    })
  }

  async findByEmailWithPassword(params: { email: string }) {
    const { email } = params
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    })
  }

  async findById(params: { userId: string }) {
    const { userId } = params
    return this.prisma.user.findUnique({
      omit: { hashedPassword: true },
      where: { id: userId },
    })
  }

  async markEmailAsVerified(params: { userId: string }): Promise<void> {
    const { userId } = params
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    })
  }

  async updatePassword(params: {
    userId: string
    hashedPassword: string
  }): Promise<void> {
    const { userId, hashedPassword } = params
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    })
  }

  async findByIdWithPassword(params: { userId: string }) {
    const { userId } = params
    return await this.prisma.user.findUnique({
      where: { id: userId },
    })
  }

  async update(params: {
    userId: string
    name: string
    lastName: string
    email: string
    hashedPassword?: string
  }): Promise<void> {
    const { userId, name, lastName, hashedPassword } = params
    await this.prisma.user.update({
      where: { id: userId },
      data: { name, lastName, ...(hashedPassword && { hashedPassword }) },
    })
  }

  async updateAvatar(params: {
    userId: string
    avatar: string | null
  }): Promise<void> {
    const { userId, avatar } = params
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar },
    })
  }
}
