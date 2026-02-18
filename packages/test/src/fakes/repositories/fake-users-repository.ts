import { randomUUID } from 'node:crypto'
import type { Data } from './data'
import type { UsersRepository } from '@python-editor/db/interfaces/users-repository'
import type { UserCreateParams } from '@python-editor/db/types/user'

export class FakeUsersRepository implements UsersRepository {
  constructor(private data: Data) {}
  async create(params: UserCreateParams) {
    const { name, lastName, email, hashedPassword } = params

    const user = {
      id: randomUUID(),
      name,
      lastName,
      email,
      hashedPassword,
      createdAt: new Date(),
    }

    this.data.items.users.push(user)

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
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
      createdAt: user.createdAt,
    }
  }

  async findByEmailWithPassword(params: { email: string }) {
    const { email } = params

    const user = this.data.items.users.find((user) => user.email === email)

    if (!user) return null

    return user
  }
}
