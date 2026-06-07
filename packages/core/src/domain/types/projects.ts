export type ProjectCreateParams = {
  id?: string
  name: string
  fileId: string
  createdAt?: string | Date | undefined
  updatedAt?: string | Date | undefined
  createdById: string
  updatedById: string
}

export type Project = {
  id: string
  name: string
  createdAt: Date
  fileId: string
  updatedAt: Date
  createdById: string
  updatedById: string
}

export type ProjectWithoutFileId = Omit<Project, 'fileId'>

export type ProjectWithSharedWith = Project & {
  sharedWith: { id: string }[]
}

export type ProjectUpdateParams = {
  projectId: string
  updatedById: string
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

export type SharedWithMeProjectListItem = {
  id: string
  name: string
  updatedAt: Date
  createdBy: { email: string }
  updatedBy: { email: string }
}
