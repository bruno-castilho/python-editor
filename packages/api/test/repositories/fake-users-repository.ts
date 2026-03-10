import { randomUUID } from 'node:crypto'
import type { Data } from './data'
import type { IUsersRepository } from '../../src/repositories/interfaces/users-repository'
import type { UserCreateParams } from '../../src/repositories/types/user'

export class FakeUsersRepository implements IUsersRepository {
  constructor(private data: Data) {}

  async create(params: UserCreateParams) {
    const { name, lastName, email, hashedPassword } = params

    const user = {
      id: randomUUID(),
      name,
      lastName,
      email,
      hashedPassword,
      emailVerified: false,
      createdAt: new Date(),
    }

    this.data.items.users.push(user)

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
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
}
