import type { User, UserCreateParams, UserWithoutPassword } from '../types/user'

export interface IUsersRepository {
  create(params: UserCreateParams): Promise<UserWithoutPassword>

  findByEmail(params: { email: string }): Promise<UserWithoutPassword | null>

  findByEmailWithPassword(params: { email: string }): Promise<User | null>

  findById(params: { userId: string }): Promise<UserWithoutPassword | null>

  markEmailAsVerified(params: { userId: string }): Promise<void>

  updatePassword(params: {
    userId: string
    hashedPassword: string
  }): Promise<void>

  findByIdWithPassword(params: { userId: string }): Promise<User | null>

  update(params: {
    userId: string
    name: string
    lastName: string
    hashedPassword?: string
  }): Promise<void>
}
