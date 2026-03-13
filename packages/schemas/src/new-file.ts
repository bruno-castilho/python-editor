import z from 'zod'

export const newFile = z.object({
  fileName: z
    .string({ message: 'Invalid file name' })
    .trim()
    .min(1, 'File name cannot be empty')
    .max(255, 'File name must be at most 255 characters')
    .refine(
      (fileName) => !fileName.includes('/'),
      'File name cannot contain "/"',
    )
    .refine(
      (fileName) => !/\0/.test(fileName),
      'File name cannot contain null characters',
    )
    .refine(
      (fileName) => !fileName.startsWith('.'),
      'File name cannot start with "."',
    )
    .refine(
      (fileName) => !fileName.endsWith('.'),
      'File name cannot end with "."',
    )
    .refine(
      (fileName) => !fileName.includes('..'),
      'File name cannot contain two or more consecutive dots',
    ),
})

export type newFileDTO = z.infer<typeof newFile>
