import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import { createContext } from '@python-editor/api/context'
import { appRouter, type AppRouter } from '@python-editor/api/routers/index'
import { makeDownloadProjectUseCase } from '@python-editor/api/use-cases/factories/make-download-project'
import { makeUploadAvatar } from '@python-editor/api/use-cases/factories/make-upload-avatar'
import { makeUploadProjectUseCase } from '@python-editor/api/use-cases/factories/make-upload-project'
import { makeUpdateProjectUseCase } from '@python-editor/api/use-cases/factories/make-update-project'
import { env } from '@python-editor/env/server'
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import Fastify from 'fastify'
import { NotAllowedToDownloadProjectError } from '@python-editor/api/use-cases/errors/not-allowed-to-download-project-error'
import { NotAllowedToUpdateProjectError } from '@python-editor/api/use-cases/errors/not-allowed-to-update-project-error'
import { ProjectDoesNotExistError } from '@python-editor/api/use-cases/errors/project-does-not-exist-error'
import { onlyUserMiddleware } from './middlewares/only-user-middleware'
import { receiveAvatarFileAndParseMiddleware } from './middlewares/receive-avatar-file-middleware'
import { receiveProjectFileMiddleware } from './middlewares/receive-project-file-middleware'

const baseCorsConfig = {
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400,
}

const fastify = Fastify({
  logger: true,
})

fastify.register(fastifyCors, baseCorsConfig)
fastify.register(fastifyCookie)
fastify.register(fastifyMultipart)

fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}':`, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
})

fastify.post(
  '/upload-avatar',
  { preHandler: [onlyUserMiddleware, receiveAvatarFileAndParseMiddleware] },
  async (request, reply) => {
    const { userId } = request.session
    const { buffer, contentType } = request.uploadedAvatarFile

    try {
      const useCase = makeUploadAvatar()
      const { avatarUrl } = await useCase.execute({
        userId,
        fileBuffer: buffer,
        contentType,
      })
      return reply.send({ avatarUrl, message: 'Avatar uploaded successfully.' })
    } catch {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  },
)

fastify.post(
  '/upload-project',
  { preHandler: [onlyUserMiddleware, receiveProjectFileMiddleware] },
  async (request, reply) => {
    const { userId } = request.session
    const { buffer, filename, contentType } = request.uploadedProjectFile

    try {
      const useCase = makeUploadProjectUseCase()
      const { project } = await useCase.execute({
        userId,
        filename,
        fileBuffer: buffer,
        contentType,
      })
      return reply.send({ project, message: 'Project uploaded successfully.' })
    } catch {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  },
)

fastify.get(
  '/download-project/:projectId',
  { preHandler: [onlyUserMiddleware] },
  async (request, reply) => {
    const { userId } = request.session
    const { projectId } = request.params as { projectId: string }

    try {
      const useCase = makeDownloadProjectUseCase()
      const { data, projectName } = await useCase.execute({
        dto: { projectId },
        userId,
      })
      return reply
        .header('Content-Type', 'application/zip')
        .header(
          'Content-Disposition',
          `attachment; filename="${projectName}.zip"`,
        )
        .send(data)
    } catch (error) {
      if (error instanceof ProjectDoesNotExistError)
        return reply.status(404).send({ message: error.message })
      if (error instanceof NotAllowedToDownloadProjectError)
        return reply.status(403).send({ message: error.message })
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  },
)

fastify.patch(
  '/update-project/:projectId',
  { preHandler: [onlyUserMiddleware, receiveProjectFileMiddleware] },
  async (request, reply) => {
    const { userId } = request.session
    const { projectId } = request.params as { projectId: string }
    const { buffer, contentType } = request.uploadedProjectFile

    try {
      const useCase = makeUpdateProjectUseCase()
      await useCase.execute({
        userId,
        dto: { projectId, fileBuffer: buffer, contentType },
      })
      return reply.send({ message: 'Project updated successfully.' })
    } catch (error) {
      if (error instanceof ProjectDoesNotExistError)
        return reply.status(404).send({ message: error.message })
      if (error instanceof NotAllowedToUpdateProjectError)
        return reply.status(403).send({ message: error.message })
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  },
)

fastify.get('/', async () => {
  return 'OK'
})

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log('Server running on port 3000')
})
