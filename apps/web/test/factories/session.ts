import { randomUUID } from 'node:crypto'

export interface FakeSession {
  sessionId: string
  userId: string
  ip: string
  device: string
  browser: string
  location: string
  lastAccess: string
}

export function createFakeSession(
  overrides?: Partial<FakeSession>,
): FakeSession {
  return {
    sessionId: randomUUID(),
    userId: randomUUID(),
    ip: '127.0.0.1',
    device: 'Desktop',
    browser: 'Chrome',
    location: 'Unknown',
    lastAccess: new Date().toISOString(),
    ...overrides,
  }
}
