export class SessionDoesNotExistsError extends Error {
  constructor() {
    super('Session not found or expired')
  }
}
