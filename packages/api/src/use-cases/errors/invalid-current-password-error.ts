export class InvalidCurrentPasswordError extends Error {
  constructor() {
    super('Senha atual incorreta')
  }
}
