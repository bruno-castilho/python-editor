import { GetUserSessionsUseCase } from './get-user-sessions'
import { FakeUserSessionsKeyValueStore } from '../../../test/key-value-stores/fake-session-key-value-store'

const USER_ID = '01900000-0000-7000-8000-000000000001'
const OTHER_USER_ID = '01900000-0000-7000-8000-000000000002'

const sessionInfo = {
  ip: '127.0.0.1',
  device: 'Linux',
  browser: 'Chrome',
  location: 'Desconhecido',
  createdAt: new Date().toISOString(),
}

let userSessionsKeyValueStore: FakeUserSessionsKeyValueStore
let sut: GetUserSessionsUseCase

describe('Get User Sessions Use Case', () => {
  beforeEach(() => {
    userSessionsKeyValueStore = new FakeUserSessionsKeyValueStore()
    sut = new GetUserSessionsUseCase(userSessionsKeyValueStore)
  })

  it('should return all sessions for the authenticated user', async () => {
    await userSessionsKeyValueStore.save({ userId: USER_ID, ...sessionInfo })
    await userSessionsKeyValueStore.save({ userId: USER_ID, ...sessionInfo })
    await userSessionsKeyValueStore.save({
      userId: OTHER_USER_ID,
      ...sessionInfo,
    })

    const { sessions } = await sut.execute({ userId: USER_ID })

    expect(sessions).toHaveLength(2)
    expect(sessions.every((s) => s.userId === USER_ID)).toBe(true)
  })

  it('should return an empty list when no sessions exist', async () => {
    const { sessions } = await sut.execute({ userId: USER_ID })

    expect(sessions).toHaveLength(0)
  })
})
