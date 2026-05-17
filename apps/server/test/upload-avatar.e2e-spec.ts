import request from 'supertest'
import { app } from '@/app'
import { makeUser } from './factories/make-user'
import { makeSession } from './factories/make-session'

describe('Upload Avatar (e2e)', () => {
  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[POST] /upload-avatar', async () => {
    const authenticatedUser = await makeUser({})
    const { accessToken } = await makeSession({
      userId: authenticatedUser.id,
    })

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    )

    const response = await request(app.server)
      .post('/upload-avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', png, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })

    expect(response.status).toEqual(200)
    expect(response.body.message).toBe('Avatar uploaded successfully.')
    expect(response.body.avatarUrl).toBeDefined()
  })
})
