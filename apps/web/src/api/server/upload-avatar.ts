import { fetchEventSource } from '@microsoft/fetch-event-source'
import { env } from '@python-editor/env/web'
import { getAccessToken } from '@/utils/access-token-store'

export interface UploadProgressEvent {
  loaded: number
  total?: number
}

export interface UploadAvatarParams {
  file: Blob
  onProgress: (event: UploadProgressEvent) => void
  onComplete: (data: { avatarUrl: string; message: string }) => void
  onError: (message: string) => void
}

export async function uploadAvatar(params: UploadAvatarParams): Promise<void> {
  const { file, onProgress, onComplete, onError } = params

  const accessToken = getAccessToken()

  const formData = new FormData()
  formData.append('file', file)

  const controller = new AbortController()

  try {
    await fetchEventSource(`${env.NEXT_PUBLIC_SERVER_URL}/upload-avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal: controller.signal,

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      async onopen(response) {
        if (!response.ok) {
          throw new Error('Failed to connect to the server.')
        }
      },

      onmessage(event) {
        if (!event.data) return

        let parsedData: Record<string, unknown>

        try {
          parsedData = JSON.parse(event.data)
        } catch {
          return
        }

        switch (event.event) {
          case 'progress':
            onProgress({
              loaded: parsedData.loaded as number,
              total: parsedData.total as number | undefined,
            })
            break

          case 'complete':
            onComplete({
              avatarUrl: parsedData.avatarUrl as string,
              message: parsedData.message as string,
            })
            controller.abort()
            break

          case 'error':
            onError(
              typeof parsedData.message === 'string'
                ? parsedData.message
                : 'Upload failed.',
            )
            controller.abort()
            break
        }
      },

      onerror(err) {
        onError(err instanceof Error ? err.message : 'Connection error.')
        controller.abort()
      },
    })
  } catch {
    onError('Failed to connect to the server.')
  }
}
