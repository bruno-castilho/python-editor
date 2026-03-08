import { compare, hash } from 'bcryptjs'
import type { IHasher } from '../interfaces/hasher'

export class PasswordHasher implements IHasher {
  constructor(private rounds: number = 6) {}

  async compare(password: string, hashedPassword: string) {
    return await compare(password, hashedPassword ?? '')
  }

  async hash(password: string) {
    return await hash(password, this.rounds)
  }
}
