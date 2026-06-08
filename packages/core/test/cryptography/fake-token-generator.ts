import type { ITokenGenerator } from '../../src/domain/interfaces/cryptography/token-generator'

export class FakeTokenGenerator implements ITokenGenerator {
  generate() {
    return 'fake-token'
  }
}
