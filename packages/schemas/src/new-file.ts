import z from 'zod'

export const newFile = z.object({
  fileName: z
    .string({ message: 'Nome de arquivo inválido' })
    .trim()
    .min(1, 'O nome do arquivo não pode ser vazio')
    .max(255, 'O nome do arquivo deve ter no máximo 255 caracteres')
    .refine(
      (fileName) => !fileName.includes('/'),
      'O nome do arquivo não pode conter "/"',
    )
    .refine(
      (fileName) => !/\0/.test(fileName),
      'O nome do arquivo não pode conter caracteres nulos',
    )
    .refine(
      (fileName) => !fileName.startsWith('.'),
      'O nome do arquivo não pode começar com "."',
    )
    .refine(
      (fileName) => !fileName.endsWith('.'),
      'O nome do arquivo não pode terminar com "."',
    )
    .refine(
      (fileName) => !fileName.includes('..'),
      'O nome do arquivo não pode conter dois ou mais pontos consecutivos',
    ),
})

export type newFileDTO = z.infer<typeof newFile>
