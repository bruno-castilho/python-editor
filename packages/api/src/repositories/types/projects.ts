import type { Prisma, Project as ProjectPrisma } from '@python-editor/db'

export type Project = ProjectPrisma

export type ProjectWithoutFileId = Omit<Project, 'fileId'>

export type ProjectCreateParams = Omit<
  Prisma.ProjectCreateInput,
  'id' | 'createdBy'
> & {
  createdById: string
}

export type PersonalProjectListItem = {
  id: string
  name: string
  updatedAt: Date
  updatedBy: { email: string }
  sharedWith: {
    id: string
    name: string
    lastName: string
    avatar: string | null
    email: string
  }[]
}
