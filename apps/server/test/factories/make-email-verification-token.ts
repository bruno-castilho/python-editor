import { EmailVerificationTokenHashGenerator } from '@python-editor/core/infra/gateways/cryptography/hash-generator'
import { EmailVerificationTokenGenerator } from '@python-editor/core/infra/gateways/cryptography/token-generator'
import { EmailVerificationTokenKeyValueStore } from '@python-editor/core/infra/gateways/valkey/email-verification-token-key-value-store'

export async function makeEmailVerificationToken(params: { userId: string }) {
  const { userId } = params

  const emailVerificationTokenGenerator = new EmailVerificationTokenGenerator()
  const emailVerificationTokenHashGenerator =
    new EmailVerificationTokenHashGenerator()
  const emailVerificationTokenKeyValueStore =
    new EmailVerificationTokenKeyValueStore()

  const token = emailVerificationTokenGenerator.generate()
  const hashedToken = await emailVerificationTokenHashGenerator.hash(token)

  await emailVerificationTokenKeyValueStore.save({
    hashedToken,
    userId,
  })

  return {
    token,
  }
}
