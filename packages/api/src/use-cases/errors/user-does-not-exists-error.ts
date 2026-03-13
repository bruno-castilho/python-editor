export class UserDoesNotExistsError extends Error {
  constructor() {
    super('O usuário não existe')
  }
}
