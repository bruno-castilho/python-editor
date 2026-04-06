import { findPersonalProjectsSchema } from '@python-editor/schemas/find-personal-projects'
import { authenticatedProcedure } from '..'
import { makeFindPersonalProjectsUseCase } from '../use-cases/factories/make-find-personal-projects'

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
}
