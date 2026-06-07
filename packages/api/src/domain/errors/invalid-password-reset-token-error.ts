export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Invalid or expired password reset token.')
  }
}
