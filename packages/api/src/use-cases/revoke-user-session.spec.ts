import { RevokeUserSessionUseCase } from './revoke-user-session'
import { FakeUserSessionsKeyValueStore } from '../../test/key-value-stores/fake-session-key-value-store'
import { SessionDoesNotExistsError } from './errors/session-does-not-exists-error'

const USER_ID = '01900000-0000-7000-8000-000000000001'
const OTHER_USER_ID = '01900000-0000-7000-8000-000000000002'

const sessionInfo = {
  ip: '127.0.0.1',
  device: 'Linux',
  browser: 'Chrome',
  location: 'Desconhecido',
  lastAccess: new Date().toISOString(),
}

let userSessionsKeyValueStore: FakeUserSessionsKeyValueStore
let sut: RevokeUserSessionUseCase

describe('Revoke User Session Use Case', () => {
  beforeEach(() => {
    userSessionsKeyValueStore = new FakeUserSessionsKeyValueStore()
    sut = new RevokeUserSessionUseCase(userSessionsKeyValueStore)
  })

  it('should revoke a session that belongs to the user', async () => {
    const sessionId = await userSessionsKeyValueStore.save({
      userId: USER_ID,
      ...sessionInfo,
    })

    await sut.execute({ dto: { sessionId }, userId: USER_ID })

    expect(userSessionsKeyValueStore.store.has(sessionId)).toBe(false)
  })

  it('should throw SessionDoesNotExistsError when session does not exist', async () => {
    await expect(() =>
      sut.execute({
        dto: { sessionId: '00000000-0000-0000-0000-000000000000' },
        userId: USER_ID,
      }),
    ).rejects.toBeInstanceOf(SessionDoesNotExistsError)
  })

  it('should throw SessionDoesNotExistsError when session belongs to a different user', async () => {
    const sessionId = await userSessionsKeyValueStore.save({
      userId: OTHER_USER_ID,
      ...sessionInfo,
    })

    await expect(() =>
      sut.execute({ dto: { sessionId }, userId: USER_ID }),
    ).rejects.toBeInstanceOf(SessionDoesNotExistsError)
  })
})
