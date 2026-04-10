import { makeOpenRouter } from '@/lib/open-router'
import { RequestAbortedError } from '@openrouter/sdk/models/errors'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import type { PythonFile } from './usePyodide'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface UseOpenRouterParams {
  apiKey: string
}

type SendMessageResult =
  | { success: false }
  | { success: true; messages: ChatMessage[] }

export function useOpenRouter({ apiKey }: UseOpenRouterParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [streamError, setStreamError] = useState<string | null>(null)

  const { data: models, isPending: isPendingModels } = useQuery({
    queryKey: ['openRouterModels'],
    queryFn: async () => {
      const response = await openRouter.models.list()
      return response.data
    },
  })

  const streamBufferRef = useRef('')
  const frameRef = useRef<number | null>(null)
  const openRouter = makeOpenRouter(apiKey)

  function resetMessages(initial?: ChatMessage[]): void {
    setMessages(initial ?? [])
  }

  function buildContextFromFiles(files: PythonFile[]): string {
    if (!files.length) return ''

    return files
      .map((file) => {
        return [
          `### File: ${file.name}`,
          '```python',
          file.content,
          '```',
        ].join('\n')
      })
      .join('\n\n')
  }

  async function sendMessage(
    content: string,
    model: string,
    contextFiles: PythonFile[],
  ): Promise<SendMessageResult> {
    setStreamError(null)

    const userMessage: ChatMessage = { role: 'user', content }
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' }

    const finalMessages: ChatMessage[] = [
      ...messages,
      userMessage,
      assistantMessage,
    ]

    setMessages(finalMessages)
    setIsStreaming(true)

    streamBufferRef.current = ''

    const flush = () => {
      setMessages((prev) => {
        const lastIndex = prev.length - 1
        const updated = [...prev]
        const last = updated[lastIndex]

        if (!last) return prev

        updated[lastIndex] = {
          ...last,
          content: streamBufferRef.current,
        }

        return updated
      })

      frameRef.current = null
    }

    try {
      const context = buildContextFromFiles(contextFiles)

      const stream = await openRouter.chat.send({
        chatGenerationParams: {
          model,
          stream: true,
          messages: [
            {
              role: 'system',
              content: context
                ? `You are a python coding assistant. Use the following python files as context:\n\n${context}`
                : 'You are a python coding assistant.',
            },
            ...messages,
            userMessage,
          ],
        },
      })

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content
        if (!delta) continue

        streamBufferRef.current += delta

        if (!frameRef.current) {
          frameRef.current = requestAnimationFrame(flush)
        }
      }

      const lastMessage = finalMessages[finalMessages.length - 1]
      if (lastMessage) {
        finalMessages[finalMessages.length - 1] = {
          ...lastMessage,
          content: streamBufferRef.current,
        }
      }

      return { success: true, messages: finalMessages }
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1))

      if (error instanceof RequestAbortedError) {
        setStreamError('Oops! Something went wrong. Please try again.')
        return { success: false }
      }

      if (error instanceof Error) {
        setStreamError(error.message)
        return { success: false }
      }

      setStreamError('Oops! Something went wrong. Please try again.')
      return { success: false }
    } finally {
      setIsStreaming(false)
    }
  }

  return {
    messages,
    isStreaming,
    streamError,
    isPendingModels,
    models,
    sendMessage,
    resetMessages,
  }
}
