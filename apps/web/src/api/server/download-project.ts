import { getAccessToken } from '@/utils/access-token-store'
import { server } from '@/lib/axios'

export async function downloadProject(
  projectId: string,
): Promise<{ arrayBuffer: ArrayBuffer; projectName: string }> {
  const response = await server.get<ArrayBuffer>(
    `/download-project/${projectId}`,
    {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      responseType: 'arraybuffer',
    },
  )

  const contentDisposition = response.headers['content-disposition'] as string
  const filenameWithExtension = contentDisposition
    .split('filename="')[1]!
    .replace('"', '')
  const projectName = filenameWithExtension.replace(/\.zip$/, '')

  return { arrayBuffer: response.data, projectName }
}
