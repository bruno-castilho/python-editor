import { env } from '@python-editor/env/web'
import { getAccessToken } from '@/utils/access-token-store'

export async function uploadAvatar(params: {
  file: Blob
}): Promise<{ avatarUrl: string; message: string }> {
  const { file } = params

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/upload-avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Failed to upload avatar.',
    )
  }

  return response.json()
}
