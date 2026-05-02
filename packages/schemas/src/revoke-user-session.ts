import z from 'zod'

export const revokeUserSessionSchema = z.object({
  sessionId: z.uuid(),
})

export type RevokeUserSessionDTO = z.infer<typeof revokeUserSessionSchema>
