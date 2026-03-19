import { randomUUID } from 'node:crypto'
import type { Data } from './data'
import type { IUsersRepository } from '../../src/repositories/interfaces/users-repository'
import type { UserCreateParams } from '../../src/repositories/types/user'

export class FakeUsersRepository implements IUsersRepository {
  constructor(private data: Data) {}

  async create(params: UserCreateParams) {
    const { name, lastName, email, hashedPassword, avatar } = params

    const user = {
      id: randomUUID(),
      name,
      lastName,
      email,
      hashedPassword,
      emailVerified: false,
      createdAt: new Date(),
      avatar: avatar || null,
    }

    this.data.items.users.push(user)

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      avatar: user.avatar,
    }
  }

  async findByEmail(params: { email: string }) {
    const { email } = params

    const user = this.data.items.users.find((user) => user.email === email)

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      avatar: user.avatar,
    }
  }

  async findById(params: { userId: string }) {
    const { userId } = params
    const user = this.data.items.users.find((u) => u.id === userId)
    if (!user) return null
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      avatar: user.avatar || null,
    }
  }

  async findByEmailWithPassword(params: { email: string }) {
    const { email } = params

    const user = this.data.items.users.find((user) => user.email === email)

    if (!user) return null

    return user
  }

  async markEmailAsVerified(params: { userId: string }) {
    const { userId } = params
    const user = this.data.items.users.find((u) => u.id === userId)

    if (user) {
      user.emailVerified = true
    }
  }

  async updatePassword(params: { userId: string; hashedPassword: string }) {
    const { userId, hashedPassword } = params
    const user = this.data.items.users.find((u) => u.id === userId)

    if (user) {
      user.hashedPassword = hashedPassword
    }
  }

  async findByIdWithPassword(params: { userId: string }) {
    const { userId } = params
    return this.data.items.users.find((u) => u.id === userId) ?? null
  }

  async update(params: {
    userId: string
    name: string
    lastName: string
    hashedPassword?: string
  }): Promise<void> {
    const { userId, name, lastName, hashedPassword } = params
    const user = this.data.items.users.find((u) => u.id === userId)

    if (user) {
      user.name = name
      user.lastName = lastName
      if (hashedPassword) user.hashedPassword = hashedPassword
    }
  }

  async updateAvatar(params: {
    userId: string
    avatar: string | null
  }): Promise<void> {
    const { userId, avatar } = params
    const user = this.data.items.users.find((u) => u.id === userId)

    if (user) {
      user.avatar = avatar
    }
  }
}
