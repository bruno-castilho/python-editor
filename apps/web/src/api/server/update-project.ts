import { getAccessToken } from '@/utils/access-token-store'
import { server } from '@/lib/axios'

interface UpdateProjectResponse {
  message: string
}

export async function updateProject(params: {
  projectId: string
  file: Blob
  filename: string
}): Promise<UpdateProjectResponse> {
  const { projectId, file, filename } = params

  const formData = new FormData()
  formData.append('file', file, filename)

  const { data } = await server.patch<UpdateProjectResponse>(
    `/update-project/${projectId}`,
    formData,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } },
  )
  return data
}
