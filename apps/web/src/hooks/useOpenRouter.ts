import { makeOpenRouter } from '@/lib/open-router'
import { RequestAbortedError } from '@openrouter/sdk/models/errors'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface UseOpenRouterParams {
  apiKey: string
}

const defaultSystemMessage: ChatMessage = {
  role: 'system',
  content:
    'You are a helpful assistant python, when you are asked to write code, make sure it is valid Python code. You must always respond in the same language the user sends their messages.',
}

export function useOpenRouter({ apiKey }: UseOpenRouterParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    defaultSystemMessage,
  ])
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

  async function sendMessage(content: string, model: string) {
    setStreamError(null)

    const userMessage: ChatMessage = { role: 'user', content }
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setIsStreaming(true)

    streamBufferRef.current = ''

    const flush = () => {
      setMessages((prev) => {
        const lastIndex = prev.length - 1
        const updated = [...prev]

        updated[lastIndex] = {
          ...updated[lastIndex],
          content: streamBufferRef.current,
        }

        return updated
      })

      frameRef.current = null
    }

    try {
      const stream = await openRouter.chat.send({
        chatGenerationParams: {
          model,
          stream: true,
          messages: [...messages, userMessage],
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
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1))
      if (error instanceof RequestAbortedError) {
        setStreamError('Oops! Something went wrong. Please try again.')
      }

      if (error instanceof Error) {
        setStreamError(error.message)
        return
      }
      setStreamError('Oops! Something went wrong. Please try again.')
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
  }
}
