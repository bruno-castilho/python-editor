import z from 'zod'

export const jwtPayloadSchema = z.object({
  sessionId: z.uuid(),
  userId: z.uuidv7(),
})

export type JWTPayloadDTO = z.infer<typeof jwtPayloadSchema>
