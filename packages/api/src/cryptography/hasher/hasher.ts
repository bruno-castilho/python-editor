import { compare, hash } from 'bcryptjs'
import type { IHasher } from '../interfaces/hasher'

export abstract class Hasher implements IHasher {
  constructor(private rounds: number) {}

  async compare(password: string, hashedPassword: string) {
    return await compare(password, hashedPassword ?? '')
  }

  async hash(password: string) {
    return await hash(password, this.rounds)
  }
}
