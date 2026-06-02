export class CannotShareProjectWithYourselfError extends Error {
  constructor() {
    super('You cannot share a project with yourself.')
  }
}
