import { verify as argon2Verify } from 'argon2'
import type { IHashCompare } from './interfaces/hash-compare'

abstract class Argon2HashCompare implements IHashCompare {
  public async compare(text: string, hashedText: string) {
    return await argon2Verify(hashedText, text)
  }
}

export class PasswordHashCompare extends Argon2HashCompare {}
