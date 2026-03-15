import type { ITokenGenerator } from '../../src/cryptography/interfaces/token-generator'

export class FakeTokenGenerator implements ITokenGenerator {
  generate() {
    return 'fake-token'
  }
}
