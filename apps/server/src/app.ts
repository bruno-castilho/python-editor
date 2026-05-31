import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import { createContext } from '@python-editor/api/context'
import { appRouter, type AppRouter } from '@python-editor/api/routers/index'
import { env } from '@python-editor/env/server'
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import Fastify from 'fastify'
import { onlyUserMiddleware } from './middlewares/only-user-middleware'
import { receiveAvatarFileAndParseMiddleware } from './middlewares/receive-avatar-file-middleware'
import { receiveProjectFileMiddleware } from './middlewares/receive-project-file-middleware'
import { updateProject } from './routes/update-project'
import { downloadAvatar } from './routes/download-avatar'
import { downloadProject } from './routes/download-project'
import { uploadProject } from './routes/upload-project'
import { uploadAvatar } from './routes/upload-avatar'

const baseCorsConfig = {
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400,
}

export const app = Fastify({
  logger: true,
})

app.register(fastifyCors, baseCorsConfig)
app.register(fastifyCookie)
app.register(fastifyMultipart)

app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}':`, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
})

app.post(
  '/upload-avatar',
  { preHandler: [onlyUserMiddleware, receiveAvatarFileAndParseMiddleware] },
  uploadAvatar,
)

app.post(
  '/upload-project',
  { preHandler: [onlyUserMiddleware, receiveProjectFileMiddleware] },
  uploadProject,
)

app.get('/download-avatar/:fileId', downloadAvatar)

app.get(
  '/download-project/:projectId',
  { preHandler: [onlyUserMiddleware] },
  downloadProject,
)

app.patch(
  '/update-project/:projectId',
  { preHandler: [onlyUserMiddleware, receiveProjectFileMiddleware] },
  updateProject,
)

app.get('/', async () => {
  return 'OK'
})
