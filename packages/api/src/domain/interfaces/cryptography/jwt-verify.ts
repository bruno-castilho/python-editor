export interface IJWTVerify<Payload> {
  verifyAndParse(token: string): Payload
}
