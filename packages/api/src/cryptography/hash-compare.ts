import { compare } from 'bcryptjs'
import type { IHashCompare } from './interfaces/hash-compare'

abstract class BcryptHashCompare implements IHashCompare {
  public async compare(text: string, hashedText: string) {
    return await compare(text, hashedText ?? '')
  }
}

export class PasswordHashCompare extends BcryptHashCompare {}
