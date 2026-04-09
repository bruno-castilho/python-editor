import { z } from 'zod'

export const saveProjectSchema = z.object({
  projectName: z
    .string({ message: 'Project name is required.' })
    .trim()
    .min(1, 'Project name cannot be empty.')
    .max(255, 'Project name must be at most 255 characters.')
    .refine(
      (name) => !/[/\\:*?"<>|\0]/.test(name),
      'Project name contains invalid characters (/ \\ : * ? " < > |).',
    ),
  saveLocation: z.enum(['local', 'remote']),
})

export type SaveProjectDTO = z.infer<typeof saveProjectSchema>
