export class NotAllowedToShareProjectError extends Error {
  constructor() {
    super('You are not allowed to share this project.')
  }
}
