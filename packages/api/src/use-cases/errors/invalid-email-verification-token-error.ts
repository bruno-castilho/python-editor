export class InvalidEmailVerificationTokenError extends Error {
  constructor() {
    super('Token de verificação inválido ou expirado.')
  }
}
