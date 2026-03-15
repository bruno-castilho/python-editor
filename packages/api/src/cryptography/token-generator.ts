import { randomBytes } from 'node:crypto'
import type { ITokenGenerator } from './interfaces/token-generator'

abstract class CSPRNGTokenGenerator implements ITokenGenerator {
  constructor(private bytes: number) {}

  public generate() {
    return randomBytes(this.bytes).toString('hex')
  }
}

export class EmailVerificationTokenGenerator extends CSPRNGTokenGenerator {
  private static TOKEN_BYTES = 32
  constructor() {
    super(EmailVerificationTokenGenerator.TOKEN_BYTES)
  }
}

export class PasswordResetTokenGenerator extends CSPRNGTokenGenerator {
  private static TOKEN_BYTES = 32
  constructor() {
    super(PasswordResetTokenGenerator.TOKEN_BYTES)
  }
}
