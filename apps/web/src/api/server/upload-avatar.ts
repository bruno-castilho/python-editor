import { getAccessToken } from '@/utils/access-token-store'
import { server } from '@/lib/axios'

interface UploadAvatarResponse {
  avatarUrl: string
  message: string
}

export async function uploadAvatar(params: {
  file: Blob
}): Promise<UploadAvatarResponse> {
  const { file } = params

  const formData = new FormData()
  formData.append('file', file)

  const { data } = await server.post<UploadAvatarResponse>(
    '/upload-avatar',
    formData,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } },
  )
  return data
}
