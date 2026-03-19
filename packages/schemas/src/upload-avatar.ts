import { z } from 'zod'

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export const uploadAvatarSchema = z.object({
  contentType: z.enum(ACCEPTED_MIME_TYPES, {
    message: 'Only JPEG, PNG, and WebP images are accepted.',
  }),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, {
    message: 'File must be smaller than 5 MB.',
  }),
})

export type UploadAvatarDTO = z.infer<typeof uploadAvatarSchema>
