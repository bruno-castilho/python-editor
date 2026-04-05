import { server } from '@/lib/axios'
import { getAccessToken } from '@/utils/access-token-store'

interface uploadAvatarParams {
  file: Blob
}

interface uploadAvatarResponse {
  avatarUrl: string
  message: string
}

export async function uploadAvatar(params: uploadAvatarParams) {
  const { file } = params
  const accessToken = getAccessToken()

  const response = await server.postForm<uploadAvatarResponse>(
    '/upload-avatar',
    { file },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  return response.data
}
