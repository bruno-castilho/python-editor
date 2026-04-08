export class NotAllowedToDownloadProjectError extends Error {
  constructor() {
    super('You are not allowed to download this project.')
  }
}
