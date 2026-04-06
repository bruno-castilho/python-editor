import { Transform } from 'node:stream'
import {
  MAX_PROJECT_FILE_SIZE_BYTES,
  uploadProjectSchema,
} from '@python-editor/schemas/upload-project'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export async function receiveProjectFileMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ message: 'No file uploaded.' })
    }

    uploadProjectSchema
      .pick({ contentType: true })
      .parse({ contentType: data.mimetype })

    let totalBytes = 0
    const sizeGuard = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        totalBytes += chunk.length
        if (totalBytes > MAX_PROJECT_FILE_SIZE_BYTES) {
          callback(new Error('File too large.'))
        } else {
          this.push(chunk)
          callback()
        }
      },
    })

    request.uploadedProjectFile = {
      stream: data.file.pipe(sizeGuard),
      filename: data.filename,
      contentType: data.mimetype,
    }
  } catch (error) {
    receiveProjectFileMiddlewareErrorHandler(error, reply)
  }
}

function receiveProjectFileMiddlewareErrorHandler(
  error: unknown,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    const contentTypeIssue = error.issues.find((issue) =>
      issue.path.includes('contentType'),
    )
    if (contentTypeIssue) {
      return reply.status(415).send({ message: contentTypeIssue.message })
    }
  }
  return reply.status(500).send({ message: 'Internal server error.' })
}
