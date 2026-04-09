import { env } from '@python-editor/env/web'
import { getAccessToken } from '@/utils/access-token-store'

export async function updateProject(params: {
  projectId: string
  file: Blob
  filename: string
}): Promise<void> {
  const { projectId, file, filename } = params

  const formData = new FormData()
  formData.append('file', file, filename)

  const response = await fetch(
    `${env.NEXT_PUBLIC_SERVER_URL}/update-project/${projectId}`,
    {
      method: 'PATCH',
      body: formData,
      credentials: 'include',
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    },
  )

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Failed to update project.',
    )
  }
}
