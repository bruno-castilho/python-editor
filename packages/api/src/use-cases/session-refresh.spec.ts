import { SessionRefreshUseCase } from './session-refresh'
import { FakeJWTSign } from '../../test/cryptography/fake-jwt-sign'
import { FakeJWTVerify } from '../../test/cryptography/fake-jwt-verify'

let jwtSign: FakeJWTSign
let jwtVerify: FakeJWTVerify
let sut: SessionRefreshUseCase

describe('Session Refresh Use Case', () => {
  beforeEach(() => {
    jwtSign = new FakeJWTSign()
    jwtVerify = new FakeJWTVerify()
    sut = new SessionRefreshUseCase(jwtVerify, jwtSign, jwtSign)
  })

  it('should be able to session refresh with a valid refresh token', async () => {
    const refreshToken = jwtSign.sign({ userId: 'user-id-1' })

    const { accessToken, refreshToken: newRefreshToken } = await sut.execute({
      refreshToken,
    })

    expect(accessToken).toEqual(expect.any(String))
    expect(newRefreshToken).toEqual(expect.any(String))
  })
})
