import { getAccessToken } from '@/utils/access-token-store'
import { server } from '@/lib/axios'

interface UploadProjectResponse {
  project: {
    name: string
    id: string
    createdAt: Date
    updatedAt: Date
    createdById: string
    updatedById: string
  }
  message: string
}

export async function uploadProject(params: {
  file: Blob
  filename: string
}): Promise<UploadProjectResponse> {
  const { file, filename } = params

  const formData = new FormData()
  formData.append('file', file, filename)

  const { data } = await server.post<UploadProjectResponse>(
    '/upload-project',
    formData,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } },
  )
  return data
}
