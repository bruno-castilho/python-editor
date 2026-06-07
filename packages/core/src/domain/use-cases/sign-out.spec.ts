import { describe, it, expect, beforeEach } from 'vitest'
import { SignOutUseCase } from './sign-out'
import { FakeJWTVerify } from '../../../test/cryptography/fake-jwt-verify'
import { FakeJWTSign } from '../../../test/cryptography/fake-jwt-sign'
import { FakeUserSessionsKeyValueStore } from '../../../test/key-value-stores/fake-session-key-value-store'

const sessionInfo = {
  ip: '127.0.0.1',
  device: 'Linux',
  browser: 'Chrome',
  location: 'Unknown',
  lastAccess: new Date().toISOString(),
}

let userSessionsKeyValueStore: FakeUserSessionsKeyValueStore
let sut: SignOutUseCase
const fakeSign = new FakeJWTSign()

describe('Sign Out Use Case', () => {
  beforeEach(() => {
    userSessionsKeyValueStore = new FakeUserSessionsKeyValueStore()
    sut = new SignOutUseCase(new FakeJWTVerify(), userSessionsKeyValueStore)
  })

  it('should be able to sign out.', async () => {
    const sessionId = await userSessionsKeyValueStore.save({
      userId: '01900000-0000-7000-8000-000000000001',
      ...sessionInfo,
    })
    const refreshToken = fakeSign.sign({
      sessionId,
      userId: '01900000-0000-7000-8000-000000000001',
    })

    await sut.execute({ refreshToken })

    expect(userSessionsKeyValueStore.store.has(sessionId)).toBe(false)
  })
})
