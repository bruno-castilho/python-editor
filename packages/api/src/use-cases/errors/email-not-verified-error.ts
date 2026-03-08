export class EmailNotVerifiedError extends Error {
  constructor() {
    super('E-mail não verificado. Por favor, verifique sua caixa de entrada.')
  }
}
