import Fastify, { type FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AddressInfo } from 'node:net'
import { appRouter, type AppRouter } from './index'
import { createContext } from '../context'
import { makePrismaUser } from '../../test/factories/make-user'
import { makePrismaProject } from '../../test/factories/make-project'
import { PasswordHashGenerator } from '../cryptography/hash-generator'
import { signInUser } from '../../test/utils/sign-in-user'
import { createAuthClient } from '../../test/utils/create-auth-client'
import { ProjectsRepository } from '../repositories/projects-repository'
import db from '@python-editor/db'

let app: FastifyInstance
let client: ReturnType<typeof createTRPCClient<AppRouter>>
let baseUrl: string
let passwordHashGenerator: PasswordHashGenerator

describe('Projects Router', () => {
  beforeEach(async () => {
    app = Fastify({ logger: false })

    app.register(fastifyCookie)
    app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext,
      } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
    })

    await app.listen({ port: 0 })
    const { port } = app.server.address() as AddressInfo
    baseUrl = `http://localhost:${port}`

    client = createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: `${baseUrl}/trpc` })],
    })

    passwordHashGenerator = new PasswordHashGenerator()
  })

  afterEach(async () => {
    await app.close()
  })

  it('findPersonalProjects', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)
    const { id, email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    await makePrismaProject({ createdById: id, updatedById: id })

    const accessToken = await signInUser(client, email, password)
    const authClient = createAuthClient(baseUrl, accessToken)

    const result = await authClient.projects.findPersonalProjects.query({})

    expect(result.message).toBe('Personal projects retrieved successfully.')
    expect(result.totalCount).toBeGreaterThanOrEqual(1)
  })

  it('findPersonalProjects pagination', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)
    const { id, email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    await Promise.all([
      makePrismaProject({ createdById: id, updatedById: id }),
      makePrismaProject({ createdById: id, updatedById: id }),
      makePrismaProject({ createdById: id, updatedById: id }),
    ])

    const accessToken = await signInUser(client, email, password)
    const authClient = createAuthClient(baseUrl, accessToken)

    const firstPage = await authClient.projects.findPersonalProjects.query({
      page: 0,
      perPage: 2,
    })

    expect(firstPage.projects.length).toBe(2)
    expect(firstPage.totalCount).toBe(3)

    const secondPage = await authClient.projects.findPersonalProjects.query({
      page: 1,
      perPage: 2,
    })

    expect(secondPage.projects.length).toBe(1)
    expect(secondPage.totalCount).toBe(3)
  })

  it('findSharedWithMeProjects', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)

    const { id: ownerId } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })
    const { id: viewerId, email: viewerEmail } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const project = await makePrismaProject({
      createdById: ownerId,
      updatedById: ownerId,
    })

    const projectsRepository = new ProjectsRepository(db.prisma)
    await projectsRepository.share({ projectId: project.id, userId: viewerId })

    const viewerAccessToken = await signInUser(client, viewerEmail, password)
    const viewerAuthClient = createAuthClient(baseUrl, viewerAccessToken)

    const result =
      await viewerAuthClient.projects.findSharedWithMeProjects.query({})

    expect(result.message).toBe(
      'Shared with me projects retrieved successfully.',
    )
    expect(result.totalCount).toBeGreaterThanOrEqual(1)
  })

  it('findSharedWithMeProjects pagination', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)

    const { id: ownerId } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })
    const { id: viewerId, email: viewerEmail } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const projects = await Promise.all([
      makePrismaProject({ createdById: ownerId, updatedById: ownerId }),
      makePrismaProject({ createdById: ownerId, updatedById: ownerId }),
      makePrismaProject({ createdById: ownerId, updatedById: ownerId }),
    ])

    const projectsRepository = new ProjectsRepository(db.prisma)
    await Promise.all(
      projects.map((project) =>
        projectsRepository.share({ projectId: project.id, userId: viewerId }),
      ),
    )

    const viewerAccessToken = await signInUser(client, viewerEmail, password)
    const viewerAuthClient = createAuthClient(baseUrl, viewerAccessToken)

    const firstPage =
      await viewerAuthClient.projects.findSharedWithMeProjects.query({
        page: 0,
        perPage: 2,
      })

    expect(firstPage.projects.length).toBe(2)
    expect(firstPage.totalCount).toBe(3)

    const secondPage =
      await viewerAuthClient.projects.findSharedWithMeProjects.query({
        page: 1,
        perPage: 2,
      })

    expect(secondPage.projects.length).toBe(1)
    expect(secondPage.totalCount).toBe(3)
  })

  it('removeProject', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)
    const { id, email } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const project = await makePrismaProject({
      createdById: id,
      updatedById: id,
    })

    const accessToken = await signInUser(client, email, password)
    const authClient = createAuthClient(baseUrl, accessToken)

    const result = await authClient.projects.removeProject.mutate({
      projectId: project.id,
    })

    expect(result.message).toBe('Project removed successfully.')
  })

  it('shareProject', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)

    const { id: ownerId, email: ownerEmail } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })
    const { email: targetEmail } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const project = await makePrismaProject({
      createdById: ownerId,
      updatedById: ownerId,
    })

    const accessToken = await signInUser(client, ownerEmail, password)
    const authClient = createAuthClient(baseUrl, accessToken)

    const result = await authClient.projects.shareProject.mutate({
      projectId: project.id,
      email: targetEmail,
    })

    expect(result.message).toBe('Project shared successfully.')
    expect(result.sharedUser.email).toBe(targetEmail)
  })

  it('unshareProject', async () => {
    const password = '@Password1'
    const hashedPassword = await passwordHashGenerator.hash(password)

    const { id: ownerId, email: ownerEmail } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })
    const { id: targetId, email: targetEmail } = await makePrismaUser({
      hashedPassword,
      emailVerified: true,
    })

    const project = await makePrismaProject({
      createdById: ownerId,
      updatedById: ownerId,
    })

    const projectsRepository = new ProjectsRepository(db.prisma)
    await projectsRepository.share({ projectId: project.id, userId: targetId })

    const accessToken = await signInUser(client, ownerEmail, password)
    const authClient = createAuthClient(baseUrl, accessToken)

    const result = await authClient.projects.unshareProject.mutate({
      projectId: project.id,
      email: targetEmail,
    })

    expect(result.message).toBe('Project unshared successfully.')
  })
})
