export class EmailAlreadyVerifiedError extends Error {
  constructor() {
    super('Email is already verified.')
  }
}
