import {
  MAX_PROJECT_FILE_SIZE_BYTES,
  uploadProjectSchema,
} from '@python-editor/schemas/upload-project'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export async function receiveProjectFileBufferMiddleware(
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

    const buffer = await data.toBuffer()

    if (buffer.byteLength > MAX_PROJECT_FILE_SIZE_BYTES) {
      return reply.status(413).send({ message: 'File too large.' })
    }

    request.uploadedProjectFileBuffer = {
      buffer,
      contentType: data.mimetype,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const contentTypeIssue = error.issues.find((i) => i.path.includes('contentType'))
      if (contentTypeIssue) {
        return reply.status(415).send({ message: contentTypeIssue.message })
      }
    }
    return reply.status(500).send({ message: 'Internal server error.' })
  }
}
