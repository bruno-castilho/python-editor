import { z } from 'zod'

const ACCEPTED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
] as const

export const MAX_PROJECT_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

export const uploadProjectSchema = z.object({
  contentType: z.enum(ACCEPTED_MIME_TYPES, {
    message: 'Only .zip files are accepted.',
  }),
  fileSize: z.number().int().positive().max(MAX_PROJECT_FILE_SIZE_BYTES, {
    message: 'File must be smaller than 500 MB.',
  }),
})

export type UploadProjectDTO = z.infer<typeof uploadProjectSchema>
