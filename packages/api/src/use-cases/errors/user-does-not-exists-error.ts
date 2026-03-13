export class UserDoesNotExistsError extends Error {
  constructor() {
    super('User does not exist')
  }
}
