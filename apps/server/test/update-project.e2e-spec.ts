import db from '@python-editor/db'
import request from 'supertest'
import { app } from '@/app'
import { makeUser } from './factories/make-user'
import { makeSession } from './factories/make-session'

describe('Update Project (e2e)', () => {
  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[PATCH] /update-project/:projectId', async () => {
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

    const response = await request(app.server)
      .patch(`/update-project/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', zip, {
        filename: 'my-project.zip',
        contentType: 'application/zip',
      })

    expect(response.status).toEqual(200)
    expect(response.body.message).toBe('Project updated successfully.')

    const projectInDb = await db.prisma.project.findUnique({
      where: { id: projectId },
    })
    expect(projectInDb?.updatedById).toBe(authenticatedUser.id)
  })
})
