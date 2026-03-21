export type Session = {
  sessionId: string
  userId: string
  ip: string
  device: string
  browser: string
  location: string
  lastAccess: string
}

export type SaveSessionParams = Omit<Session, 'sessionId'>
