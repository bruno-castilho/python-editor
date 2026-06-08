import { PasswordResetTokenHashGenerator } from '@python-editor/core/infra/gateways/cryptography/hash-generator'
import { PasswordResetTokenGenerator } from '@python-editor/core/infra/gateways/cryptography/token-generator'
import { PasswordResetTokenKeyValueStore } from '@python-editor/core/infra/gateways/valkey/password-reset-token-key-value-store'

export async function makePasswordResetToken(params: { userId: string }) {
  const { userId } = params

  const passwordResetTokenGenerator = new PasswordResetTokenGenerator()
  const passwordResetTokenHashGenerator = new PasswordResetTokenHashGenerator()
  const passwordResetTokenKeyValueStore = new PasswordResetTokenKeyValueStore()

  const token = passwordResetTokenGenerator.generate()
  const hashedToken = await passwordResetTokenHashGenerator.hash(token)

  await passwordResetTokenKeyValueStore.save({
    hashedToken,
    userId,
  })

  return {
    token,
  }
}
