import { HeadObjectCommand } from '@aws-sdk/client-s3'
import db from '@python-editor/db'
import { s3 } from '@python-editor/s3'
import request from 'supertest'
import { v7 as uuidv7 } from 'uuid'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AccessTokenSign } from '@python-editor/api/cryptography/jwt-sign'
import { makePrismaUser } from '@python-editor/api/test/factories/make-user'
import { app } from '@/app'

// Minimal valid empty zip (End of Central Directory record, 22 bytes)
const EMPTY_ZIP = Buffer.from(
  '504B05060000000000000000000000000000000000000000',
  'hex',
)

describe('Upload Project (e2e)', () => {
  let accessToken: string

  beforeEach(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('[POST] /upload-project', async () => {
    const userId = uuidv7()
    const sessionId = uuidv7()

    await makePrismaUser({
      id: userId,
    })

    const accessTokenSign = new AccessTokenSign()

    accessToken = accessTokenSign.sign({
      userId,
      sessionId,
    })

    const response = await request(app.server)
      .post('/upload-project')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', EMPTY_ZIP, {
        filename: 'my-project.zip',
        contentType: 'application/zip',
      })

    expect(response.status).toEqual(200)
    expect(response.body.message).toBe('Project uploaded successfully.')
    expect(response.body.project).toBeDefined()
    expect(response.body.project.name).toBe('my-project')

    const projectInDb = await db.prisma.project.findUnique({
      where: { id: response.body.project.id },
    })
    expect(projectInDb).not.toBeNull()
    expect(projectInDb?.name).toBe('my-project')
    expect(projectInDb?.createdById).toBe(userId)

    const headResult = await s3.send(
      new HeadObjectCommand({
        Bucket: 'projects',
        Key: projectInDb!.fileId,
      }),
    )
    expect(headResult.$metadata.httpStatusCode).toBe(200)
  })
})
