import { Hasher } from './hasher'

export class PasswordHasher extends Hasher {
  private static readonly ROUNDS = 6

  constructor() {
    super(PasswordHasher.ROUNDS)
  }
}
