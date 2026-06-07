import { SessionRefreshUseCase } from './session-refresh'
import { FakeJWTSign } from '../../../test/cryptography/fake-jwt-sign'
import { FakeJWTVerify } from '../../../test/cryptography/fake-jwt-verify'
import { FakeUserSessionsKeyValueStore } from '../../../test/key-value-stores/fake-session-key-value-store'
import { SessionDoesNotExistsError } from '../errors/session-does-not-exists-error'

const USER_ID = '01900000-0000-7000-8000-000000000001'

let jwtSign: FakeJWTSign
let jwtVerify: FakeJWTVerify
let userSessionsKeyValueStore: FakeUserSessionsKeyValueStore
let sut: SessionRefreshUseCase

let sessionId: string

describe('Session Refresh Use Case', () => {
  beforeEach(async () => {
    jwtSign = new FakeJWTSign()
    jwtVerify = new FakeJWTVerify()
    userSessionsKeyValueStore = new FakeUserSessionsKeyValueStore()
    sut = new SessionRefreshUseCase(
      jwtVerify,
      jwtSign,
      jwtSign,
      userSessionsKeyValueStore,
    )

    sessionId = await userSessionsKeyValueStore.save({
      userId: USER_ID,
      ip: '127.0.0.1',
      device: 'Linux',
      browser: 'Chrome',
      location: 'Desconhecido',
      lastAccess: new Date().toISOString(),
    })
  })

  it('should be able to session refresh with a valid refresh token', async () => {
    const refreshToken = jwtSign.sign({
      sessionId,
      userId: USER_ID,
    })

    const { accessToken, refreshToken: newRefreshToken } = await sut.execute({
      refreshToken,
    })

    expect(accessToken).toEqual(expect.any(String))
    expect(newRefreshToken).toEqual(expect.any(String))

    const entry = userSessionsKeyValueStore.store.get(sessionId)
    expect(entry?.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('should not be able to refresh a session that does not exist', async () => {
    const refreshToken = jwtSign.sign({
      sessionId: '00000000-0000-0000-0000-000000000000',
      userId: USER_ID,
    })

    await expect(() => sut.execute({ refreshToken })).rejects.toBeInstanceOf(
      SessionDoesNotExistsError,
    )
  })
})
