import { faker } from '@faker-js/faker'
import {
  AccessTokenSign,
  RefreshTokenSign,
} from '@python-editor/api/infra/gateways/cryptography/jwt-sign'
import { UserSessionsKeyValueStore } from '@python-editor/api/infra/gateways/valkey/user-sessions-key-value-store'

import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

export async function makeSession(params: { userId: string }) {
  const { userId } = params

  const accessTokenSign = new AccessTokenSign()
  const refreshTokenSign = new RefreshTokenSign()
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()

  const sessionId = await userSessionsKeyValueStore.save({
    userId,
    ip: faker.internet.ipv4(),
    device: 'Desktop',
    browser: 'Firefox',
    location: faker.location.city(),
    lastAccess: new Date().toISOString(),
  })

  const payload: JWTPayloadDTO = { sessionId, userId }

  const accessToken = accessTokenSign.sign(payload)
  const refreshToken = refreshTokenSign.sign(payload)

  return {
    sessionId,
    accessToken,
    refreshToken,
  }
}
