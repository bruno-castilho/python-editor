export interface IJWTSign<Payload> {
  sign(payload: Payload): string
}
