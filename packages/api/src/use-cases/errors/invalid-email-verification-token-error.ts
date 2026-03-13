export class InvalidEmailVerificationTokenError extends Error {
  constructor() {
    super('Invalid or expired verification token.')
  }
}
