import request from 'supertest'
import { app } from '@/app'
import { makeUser } from './factories/make-user'
import { makeSession } from './factories/make-session'

describe('Download Project (e2e)', () => {
  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[GET] /download-project/:projectId', async () => {
    const authenticatedUser = await makeUser({})
    const { accessToken } = await makeSession({
      userId: authenticatedUser.id,
    })

    const zip = Buffer.from(
      '504B05060000000000000000000000000000000000000000',
      'hex',
    )

    const uploadResponse = await request(app.server)
      .post('/upload-project')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', zip, {
        filename: 'my-project.zip',
        contentType: 'application/zip',
      })

    expect(uploadResponse.status).toEqual(200)
    const projectId = uploadResponse.body.project.id
    const projectName = uploadResponse.body.project.name

    const response = await request(app.server)
      .get(`/download-project/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toEqual(200)
    expect(response.headers['content-type']).toBe('application/zip')
    expect(response.headers['content-disposition']).toBe(
      `attachment; filename="${projectName}.zip"`,
    )
  })
})
