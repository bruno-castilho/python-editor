import { findPersonalProjectsSchema } from '@python-editor/schemas/find-personal-projects'
import { removeProjectSchema } from '@python-editor/schemas/remove-project'
import { authenticatedProcedure } from '..'
import { makeFindPersonalProjectsUseCase } from '../use-cases/factories/make-find-personal-projects'
import { makeRemoveProjectUseCase } from '../use-cases/factories/make-remove-project'

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

  removeProject: authenticatedProcedure
    .input(removeProjectSchema)
    .mutation(async ({ input: dto, ctx }) => {
      const removeProjectUseCase = makeRemoveProjectUseCase()
      await removeProjectUseCase.execute({ dto, userId: ctx.session.userId })
      return { message: 'Project removed successfully.' }
    }),
}
