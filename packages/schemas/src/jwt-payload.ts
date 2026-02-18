import z from 'zod'

export const jwtPayloadSchema = z.object({
  userId: z.uuidv7(),
})

export type JWTPayloadDTO = z.infer<typeof jwtPayloadSchema>
