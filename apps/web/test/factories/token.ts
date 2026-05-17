import { randomUUID } from 'node:crypto'

export function createMockAccessToken(sessionId?: string): string {
  const resolvedSessionId = sessionId ?? randomUUID()
  const payload = Buffer.from(
    JSON.stringify({ sessionId: resolvedSessionId, exp: 9999999999 }),
  ).toString('base64')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.mock`
}
