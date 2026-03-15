import { hash } from 'bcryptjs'
import { createHash } from 'node:crypto'
import type { IHashGenerator } from './interfaces/hash-generator'

abstract class BcryptHashGenerator implements IHashGenerator {
  constructor(private rounds: number) {}

  public async hash(text: string) {
    return await hash(text, this.rounds)
  }
}

export class PasswordHashGenerator extends BcryptHashGenerator {
  private static ROUNDS = 6

  constructor() {
    super(PasswordHashGenerator.ROUNDS)
  }
}

abstract class SHA256HashGenerator implements IHashGenerator {
  public async hash(text: string) {
    return createHash('sha256').update(text).digest('hex')
  }
}

export class EmailVerificationTokenHashGenerator extends SHA256HashGenerator {}

export class PasswordResetTokenHashGenerator extends SHA256HashGenerator {}
