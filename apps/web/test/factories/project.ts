import { randomUUID } from 'node:crypto'

export interface FakeProject {
  name: string
  id: string
  createdAt: Date
  updatedAt: Date
  createdById: string
  updatedById: string
}

export interface FakePersonalProject {
  id: string
  name: string
  updatedAt: string
  updatedBy: { email: string }
  sharedWith: {
    id: string
    name: string
    lastName: string
    email: string
    avatar: null
    avatarUrl: null
  }[]
}

export interface FakeSharedWithMeProject {
  id: string
  name: string
  updatedAt: string
  createdBy: { email: string }
  updatedBy: { email: string }
}

export function createFakeProject(
  overrides?: Partial<FakeProject>,
): FakeProject {
  return {
    id: randomUUID(),
    name: 'test-project',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user-1',
    updatedById: 'user-1',
    ...overrides,
  }
}

export function createFakePersonalProject(
  overrides?: Partial<FakePersonalProject>,
): FakePersonalProject {
  return {
    id: randomUUID(),
    name: 'test-project',
    updatedAt: new Date().toISOString(),
    updatedBy: { email: `owner-${randomUUID()}@example.com` },
    sharedWith: [],
    ...overrides,
  }
}

export function createFakeSharedWithMeProject(
  overrides?: Partial<FakeSharedWithMeProject>,
): FakeSharedWithMeProject {
  const ownerEmail = `owner-${randomUUID()}@example.com`
  return {
    id: randomUUID(),
    name: 'shared-project',
    updatedAt: new Date().toISOString(),
    createdBy: { email: ownerEmail },
    updatedBy: { email: ownerEmail },
    ...overrides,
  }
}
