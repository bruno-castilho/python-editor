import request from 'supertest'
import { v7 as uuidv7 } from 'uuid'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { AccessTokenSign } from '@python-editor/api/cryptography/jwt-sign'
import { makePrismaUser } from '@python-editor/api/test/factories/make-user'
import { app } from '@/app'

const EMPTY_ZIP = Buffer.from(
  '504B05060000000000000000000000000000000000000000',
  'hex',
)

describe('Download Project (e2e)', () => {
  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[GET] /download-project/:projectId', async () => {
    const userId = uuidv7()
    const sessionId = uuidv7()

    await makePrismaUser({ id: userId })

    const accessTokenSign = new AccessTokenSign()
    const accessToken = accessTokenSign.sign({ userId, sessionId })

    const uploadResponse = await request(app.server)
      .post('/upload-project')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', EMPTY_ZIP, {
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
