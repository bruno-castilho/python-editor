import { randomUUID } from 'node:crypto'

export interface FakeUser {
  id: string
  email: string
  name: string
  lastName: string
  emailVerified: boolean
  avatar: string | null
  avatarUrl: string | null
  createdAt: string
}

export function createFakeUser(overrides?: Partial<FakeUser>): FakeUser {
  return {
    id: randomUUID(),
    email: `test-${randomUUID()}@example.com`,
    name: 'John',
    lastName: 'Doe',
    emailVerified: true,
    avatar: null,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}
