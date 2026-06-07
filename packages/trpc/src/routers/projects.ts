import { findPersonalProjectsSchema } from '@python-editor/schemas/find-personal-projects'
import { findSharedWithMeProjectsSchema } from '@python-editor/schemas/find-shared-with-me-projects'
import { removeProjectSchema } from '@python-editor/schemas/remove-project'
import { shareProjectSchema } from '@python-editor/schemas/share-project'
import { unshareProjectSchema } from '@python-editor/schemas/unshare-project'
import { authenticatedProcedure } from '..'
import { makeFindPersonalProjectsUseCase } from '@python-editor/core/infra/factories/make-find-personal-projects'
import { makeFindSharedWithMeProjectsUseCase } from '@python-editor/core/infra/factories/make-find-shared-with-me-projects'
import { makeRemoveProjectUseCase } from '@python-editor/core/infra/factories/make-remove-project'
import { makeShareProjectUseCase } from '@python-editor/core/infra/factories/make-share-project'
import { makeUnshareProjectUseCase } from '@python-editor/core/infra/factories/make-unshare-project'

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
        projects,
        totalCount,
      }
    }),

  findSharedWithMeProjects: authenticatedProcedure
    .input(findSharedWithMeProjectsSchema)
    .query(async ({ input: dto, ctx }) => {
      const findSharedWithMeProjectsUseCase =
        makeFindSharedWithMeProjectsUseCase()
      const { projects, totalCount } =
        await findSharedWithMeProjectsUseCase.execute({
          dto,
          userId: ctx.session.userId,
        })
      return {
        message: 'Shared with me projects retrieved successfully.',
        projects,
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
        sharedUser,
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
