import request from 'supertest'
import { app } from '@/app'
import { makeUser } from './factories/make-user'
import { makeSession } from './factories/make-session'

describe('Upload Project (e2e)', () => {
  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[POST] /upload-project', async () => {
    const authenticatedUser = await makeUser({})
    const { accessToken } = await makeSession({
      userId: authenticatedUser.id,
    })

    const zip = Buffer.from(
      '504B05060000000000000000000000000000000000000000',
      'hex',
    )
    const response = await request(app.server)
      .post('/upload-project')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', zip, {
        filename: 'my-project.zip',
        contentType: 'application/zip',
      })

    expect(response.status).toEqual(200)
    expect(response.body.message).toBe('Project uploaded successfully.')
    expect(response.body.project).toBeDefined()
    expect(response.body.project.name).toBe('my-project')
  })
})
