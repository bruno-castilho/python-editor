import { Hasher } from './hasher'

export class EmailVerificationTokenHasher extends Hasher {
  private static readonly ROUNDS = 7

  constructor() {
    super(EmailVerificationTokenHasher.ROUNDS)
  }
}
