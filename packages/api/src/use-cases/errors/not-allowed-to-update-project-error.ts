export class NotAllowedToUpdateProjectError extends Error {
  constructor() {
    super('You are not allowed to update this project.')
  }
}
