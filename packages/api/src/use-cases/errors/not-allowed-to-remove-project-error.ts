export class NotAllowedToRemoveProjectError extends Error {
  constructor() {
    super('You are not allowed to remove this project.')
  }
}
