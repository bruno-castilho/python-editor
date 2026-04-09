import axios from 'axios'
import { env } from '@python-editor/env/web'
import { getAccessToken } from '@/utils/access-token-store'

export async function downloadProject(
  projectId: string,
): Promise<{ arrayBuffer: ArrayBuffer; projectName: string }> {
  const accessToken = getAccessToken()

  const response = await axios.get<ArrayBuffer>(
    `${env.NEXT_PUBLIC_SERVER_URL}/download-project/${projectId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'arraybuffer',
      withCredentials: true,
    },
  )

  const contentDisposition = response.headers['content-disposition'] as string
  const filenameWithExtension = contentDisposition
    .split('filename="')[1]!
    .replace('"', '')
  const projectName = filenameWithExtension.replace(/\.zip$/, '')

  return { arrayBuffer: response.data, projectName }
}
