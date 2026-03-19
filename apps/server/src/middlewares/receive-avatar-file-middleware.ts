import {
  MAX_FILE_SIZE_BYTES,
  uploadAvatarSchema,
} from '@python-editor/schemas/upload-avatar'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export async function receiveAvatarFileAndParseMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ message: 'No file uploaded.' })
    }

    const chunks: Buffer[] = []
    let totalSize = 0

    for await (const chunk of data.file) {
      totalSize += chunk.length
      if (totalSize > MAX_FILE_SIZE_BYTES) {
        data.file.resume()
        return reply.status(413).send({ message: 'File too large.' })
      }
      chunks.push(chunk)
    }

    uploadAvatarSchema.parse({
      contentType: data.mimetype,
      fileSize: totalSize,
    })

    request.uploadedFile = {
      buffer: Buffer.concat(chunks),
      contentType: data.mimetype,
    }
  } catch (error) {
    receiveAvatarFileMiddlewareErrorHandler(error, reply)
  }
}

function receiveAvatarFileMiddlewareErrorHandler(
  error: unknown,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    const contentTypeIssue = error.issues.find((i) =>
      i.path.includes('contenType'),
    )
    if (contentTypeIssue) {
      return reply.status(415).send({ message: contentTypeIssue.message })
    }

    const fileSizeIssue = error.issues.find((i) => i.path.includes('fileSize'))
    if (fileSizeIssue) {
      return reply.status(413).send({ message: fileSizeIssue.message })
    }
  }
  return reply.status(500).send({ message: 'Internal server error.' })
}
