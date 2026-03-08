import type { IToken } from '../../src/cryptography/interfaces/token'

export class FakeToken implements IToken {
  generate() {
    return 'fake-token'
  }
}
