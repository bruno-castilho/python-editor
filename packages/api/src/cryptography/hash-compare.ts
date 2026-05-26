import { verify } from '@node-rs/argon2'
import type { IHashCompare } from './interfaces/hash-compare'

abstract class Argon2HashCompare implements IHashCompare {
  public async compare(text: string, hashedText: string) {
    return await verify(hashedText, text)
  }
}

export class PasswordHashCompare extends Argon2HashCompare {}
