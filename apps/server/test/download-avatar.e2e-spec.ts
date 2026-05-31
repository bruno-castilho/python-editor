import request from 'supertest'
import { app } from '@/app'
import { makeUser } from './factories/make-user'
import { makeSession } from './factories/make-session'
import { assignUserAvatar } from './helpers/upload-avatar'

describe('Download Avatar (e2e)', () => {
  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[GET] /download-avatar/:fileId', async () => {
    const authenticatedUser = await makeUser({})
    const { accessToken } = await makeSession({
      userId: authenticatedUser.id,
    })

    const { fileId, contentType, fileBuffer } = await assignUserAvatar({
      userId: authenticatedUser.id,
    })

    const response = await request(app.server)
      .get(`/download-avatar/${fileId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => callback(null, Buffer.concat(chunks)))
      })

    expect(response.status).toEqual(200)
    expect(response.headers['content-type']).toBe(contentType)
    expect(response.body).toEqual(fileBuffer)
  })
})
