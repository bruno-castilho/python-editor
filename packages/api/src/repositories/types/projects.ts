import type { Prisma, Project as ProjectPrisma } from '@python-editor/db'

export type Project = ProjectPrisma

export type ProjectWithoutFileId = Omit<Project, 'fileId'>

export type ProjectCreateParams = Omit<
  Prisma.ProjectCreateInput,
  'id' | 'createdBy'
> & {
  createdById: string
}
