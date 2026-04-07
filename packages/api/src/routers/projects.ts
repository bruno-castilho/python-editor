import { findPersonalProjectsSchema } from '@python-editor/schemas/find-personal-projects'
import { removeProjectSchema } from '@python-editor/schemas/remove-project'
import { shareProjectSchema } from '@python-editor/schemas/share-project'
import { unshareProjectSchema } from '@python-editor/schemas/unshare-project'
import { authenticatedProcedure } from '..'
import { makeFindPersonalProjectsUseCase } from '../use-cases/factories/make-find-personal-projects'
import { makeRemoveProjectUseCase } from '../use-cases/factories/make-remove-project'
import { makeShareProjectUseCase } from '../use-cases/factories/make-share-project'
import { makeUnshareProjectUseCase } from '../use-cases/factories/make-unshare-project'
import { env } from '@python-editor/env/server'

export const projectsRouter = {
  findPersonalProjects: authenticatedProcedure
    .input(findPersonalProjectsSchema)
    .query(async ({ input: dto, ctx }) => {
      const findPersonalProjectsUseCase = makeFindPersonalProjectsUseCase()
      const { projects, totalCount } =
        await findPersonalProjectsUseCase.execute({
          dto,
          userId: ctx.session.userId,
        })
      return {
        message: 'Personal projects retrieved successfully.',
        projects: projects.map((project) => ({
          ...project,
          sharedWith: project.sharedWith.map(({ avatar, ...sharedUser }) => ({
            ...sharedUser,
            avatarUrl: avatar ? `${env.STORAGE_PUBLIC_URL}/${avatar}` : null,
          })),
        })),
        totalCount,
      }
    }),

  removeProject: authenticatedProcedure
    .input(removeProjectSchema)
    .mutation(async ({ input: dto, ctx }) => {
      const removeProjectUseCase = makeRemoveProjectUseCase()
      await removeProjectUseCase.execute({ dto, userId: ctx.session.userId })
      return { message: 'Project removed successfully.' }
    }),

  shareProject: authenticatedProcedure
    .input(shareProjectSchema)
    .mutation(async ({ input: dto, ctx }) => {
      const shareProjectUseCase = makeShareProjectUseCase()
      const { sharedUser } = await shareProjectUseCase.execute({
        dto,
        userId: ctx.session.userId,
      })
      return {
        message: 'Project shared successfully.',
        sharedUser: {
          ...sharedUser,
          avatarUrl: sharedUser.avatar
            ? `${env.STORAGE_PUBLIC_URL}/${sharedUser.avatar}`
            : null,
        },
      }
    }),

  unshareProject: authenticatedProcedure
    .input(unshareProjectSchema)
    .mutation(async ({ input: dto, ctx }) => {
      const unshareProjectUseCase = makeUnshareProjectUseCase()
      await unshareProjectUseCase.execute({ dto, userId: ctx.session.userId })
      return { message: 'Project unshared successfully.' }
    }),
}
