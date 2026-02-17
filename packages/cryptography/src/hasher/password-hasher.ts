import { compare, hash } from 'bcryptjs'
import type { Hasher } from '../interfaces/hasher'

export class PasswordHasher implements Hasher {
  ROUNDS = 6

  async compare(password: string, hashedPassword: string) {
    return await compare(password, hashedPassword ?? '')
  }

  async hash(password: string) {
    return await hash(password, this.ROUNDS)
  }
}
