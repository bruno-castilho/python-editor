import { hash } from '@node-rs/argon2'
import { createHash } from 'node:crypto'
import type { IHashGenerator } from './interfaces/hash-generator'

abstract class Argon2HashGenerator implements IHashGenerator {
  public async hash(text: string) {
    return await hash(text)
  }
}

export class PasswordHashGenerator extends Argon2HashGenerator {
  constructor() {
    super()
  }
}

abstract class SHA256HashGenerator implements IHashGenerator {
  public async hash(text: string) {
    return createHash('sha256').update(text).digest('hex')
  }
}

export class EmailVerificationTokenHashGenerator extends SHA256HashGenerator {}

export class PasswordResetTokenHashGenerator extends SHA256HashGenerator {}
