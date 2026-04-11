'use client'
import { db, type ChatSession } from '@/lib/chat-sessions'
import type { ChatMessage } from '@/hooks/useOpenRouter'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'

interface UseChatSessionsReturn {
  sessions: ChatSession[]
  activeSessionId: string | null
  newSession: (messages: ChatMessage[], model: string) => Promise<void>
  updateCurrentSession: (
    messages: ChatMessage[],
    model: string,
  ) => Promise<void>
  switchActiveSession: (id: string | null) => void
  renameSession: (id: string, name: string) => Promise<void>
  deleteSession: (id: string) => Promise<void>
}

export function useChatSessions(): UseChatSessionsReturn {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const sessions =
    useLiveQuery(
      () => db.sessions.orderBy('updatedAt').reverse().toArray(),
      [],
    ) ?? []

  async function newSession(messages: ChatMessage[], model: string) {
    const firstUserMessage = messages.find((message) => message.role === 'user')
    if (!firstUserMessage) return

    const id = crypto.randomUUID()
    const name = generateSessionName(firstUserMessage.content)

    await db.sessions.add({
      id,
      name,
      messages,
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    setActiveSessionId(id)
  }

  function generateSessionName(firstUserMessage: string) {
    return firstUserMessage.trim().slice(0, 50)
  }

  async function updateCurrentSession(messages: ChatMessage[], model: string) {
    if (!activeSessionId) return

    await db.sessions.update(activeSessionId, {
      messages,
      model,
      updatedAt: new Date(),
    })
  }

  function switchActiveSession(id: string | null) {
    setActiveSessionId(id)
  }

  async function renameSession(id: string, name: string): Promise<void> {
    await db.sessions.update(id, { name })
  }

  async function deleteSession(id: string): Promise<void> {
    await db.sessions.delete(id)
    if (id === activeSessionId) {
      setActiveSessionId(null)
    }
  }

  return {
    sessions,
    activeSessionId,
    newSession,
    updateCurrentSession,
    switchActiveSession,
    renameSession,
    deleteSession,
  }
}
