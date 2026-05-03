import request from 'supertest'
import { v7 as uuidv7 } from 'uuid'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { AccessTokenSign } from '@python-editor/api/cryptography/jwt-sign'
import { makePrismaUser } from '@python-editor/api/test/factories/make-user'

// Minimal valid 1×1 pixel PNG
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

describe('Upload Avatar (e2e)', () => {
  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[POST] /upload-avatar', async () => {
    const userId = uuidv7()
    const sessionId = uuidv7()

    await makePrismaUser({ id: userId })

    const accessTokenSign = new AccessTokenSign()
    const accessToken = accessTokenSign.sign({ userId, sessionId })

    const response = await request(app.server)
      .post('/upload-avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', MINIMAL_PNG, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })

    expect(response.status).toEqual(200)
    expect(response.body.message).toBe('Avatar uploaded successfully.')
    expect(response.body.avatarUrl).toBeDefined()
  })
})
