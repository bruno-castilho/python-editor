export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Token de redefinição de senha inválido ou expirado.')
  }
}
