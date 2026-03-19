import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import { createContext } from '@python-editor/api/context'
import { appRouter, type AppRouter } from '@python-editor/api/routers/index'
import { makeUploadAvatar } from '@python-editor/api/use-cases/factories/make-upload-avatar'
import { UserDoesNotExistsError } from '@python-editor/api/use-cases/errors/user-does-not-exists-error'
import { env } from '@python-editor/env/server'
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import Fastify from 'fastify'
import { onlyUserMiddleware } from './middlewares/only-user-middleware'
import { receiveAvatarFileAndParseMiddleware } from './middlewares/receive-avatar-file-middleware'

const baseCorsConfig = {
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
    try {
      const { userId } = request.session
      const { buffer, contentType } = request.uploadedFile

      const uploadAvatarUseCase = makeUploadAvatar()
      const { avatarUrl } = await uploadAvatarUseCase.execute({
        userId,
        fileBuffer: buffer,
        contentType,
      })

      return reply
        .status(200)
        .send({ avatarUrl, message: 'Avatar uploaded successfully' })
    } catch (error) {
      if (error instanceof UserDoesNotExistsError) {
        return reply.status(404).send({ message: error.message })
      }
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
