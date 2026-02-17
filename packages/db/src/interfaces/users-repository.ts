import type { UserCreateParams, UserWithoutPassword } from '../types/user'

export interface UsersRepository {
  create(params: UserCreateParams): Promise<UserWithoutPassword>

  findByEmail(params: { email: string }): Promise<UserWithoutPassword | null>
}
