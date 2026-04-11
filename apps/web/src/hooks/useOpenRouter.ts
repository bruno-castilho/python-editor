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
  const abortControllerRef = useRef<AbortController | null>(null)
  const openRouter = makeOpenRouter(apiKey)

  function switchMessages(initial: ChatMessage[]): void {
    setMessages(initial ?? [])
    setStreamError(null)
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
    finallyCallback: (messages: ChatMessage[], model: string) => void,
  ) {
    setStreamError(null)

    const userMessage: ChatMessage = { role: 'user', content }
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' }

    let updatedMessages: ChatMessage[] = [
      ...messages,
      userMessage,
      assistantMessage,
    ]

    setMessages(updatedMessages)
    setIsStreaming(true)

    streamBufferRef.current = ''

    const flush = () => {
      setMessages((messages) => {
        const lastIndex = messages.length - 1
        const lastAssistantMessage = messages[lastIndex]

        if (!lastAssistantMessage) return messages

        const updatedMessages = [...messages]
        updatedMessages[lastIndex] = {
          ...lastAssistantMessage,
          content: streamBufferRef.current,
        }

        return updatedMessages
      })

      frameRef.current = null
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const context = buildContextFromFiles(contextFiles)

    try {
      const stream = await openRouter.chat.send(
        {
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
        },
        { signal: abortController.signal },
      )

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content
        if (!delta) continue

        streamBufferRef.current += delta

        if (!frameRef.current) {
          frameRef.current = requestAnimationFrame(flush)
        }
      }
    } catch (error) {
      if (error instanceof RequestAbortedError) {
        flush()
        return
      }

      updatedMessages = updatedMessages.slice(0, -1)
      setMessages(updatedMessages)

      if (error instanceof Error) {
        setStreamError(error.message)
        return
      }

      setStreamError('Oops! Something went wrong. Please try again.')
    } finally {
      const lastMessage = updatedMessages[updatedMessages.length - 1]
      if (lastMessage.role === 'assistant') {
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: streamBufferRef.current,
        }
      }

      finallyCallback(updatedMessages, model)

      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }

  function stopStreaming(): void {
    abortControllerRef.current?.abort()
  }

  return {
    messages,
    isStreaming,
    streamError,
    isPendingModels,
    models,
    sendMessage,
    stopStreaming,
    switchMessages,
  }
}
