export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Email not verified. Please check your inbox.')
  }
}
