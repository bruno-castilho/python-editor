import axios from 'axios'
import { env } from '@python-editor/env/web'
import { getAccessToken } from '@/utils/access-token-store'

export async function downloadProject(projectId: string): Promise<ArrayBuffer> {
  const accessToken = getAccessToken()

  const response = await axios.get<ArrayBuffer>(
    `${env.NEXT_PUBLIC_SERVER_URL}/download-project/${projectId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'arraybuffer',
      withCredentials: true,
    },
  )

  return response.data
}
