export class InvalidCurrentPasswordError extends Error {
  constructor() {
    super('Incorrect current password')
  }
}
