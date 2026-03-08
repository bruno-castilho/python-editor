import { randomBytes } from 'node:crypto'
import type { IToken } from '../interfaces/token'

export class EmailVerificationToken implements IToken {
  generate() {
    return randomBytes(32).toString('hex')
  }
}
