'use client'

import { db, generateSessionName, type ChatSession } from '@/lib/chat-sessions'
import type { ChatMessage } from '@/hooks/useOpenRouter'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'

interface UseChatSessionsReturn {
  sessions: ChatSession[]
  activeSessionId: string | null
  persistFirstExchange: (
    messages: ChatMessage[],
    model: string,
  ) => Promise<void>
  updateCurrentSession: (
    messages: ChatMessage[],
    model: string,
  ) => Promise<void>
  loadSession: (session: ChatSession) => {
    messages: ChatMessage[]
    model: string
  }
  startNewSession: () => void
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

  async function persistFirstExchange(
    messages: ChatMessage[],
    model: string,
  ): Promise<void> {
    const firstUserMessage = messages.find((message) => message.role === 'user')
    if (!firstUserMessage) return

    const id = crypto.randomUUID()
    const name = generateSessionName(firstUserMessage.content)
    const now = new Date()

    await db.sessions.add({
      id,
      name,
      messages,
      model,
      createdAt: now,
      updatedAt: now,
    })

    setActiveSessionId(id)
  }

  async function updateCurrentSession(
    messages: ChatMessage[],
    model: string,
  ): Promise<void> {
    if (!activeSessionId) return

    await db.sessions.update(activeSessionId, {
      messages,
      model,
      updatedAt: new Date(),
    })
  }

  function loadSession(session: ChatSession): {
    messages: ChatMessage[]
    model: string
  } {
    setActiveSessionId(session.id)
    return { messages: session.messages, model: session.model }
  }

  function startNewSession(): void {
    setActiveSessionId(null)
  }

  async function renameSession(id: string, name: string): Promise<void> {
    await db.sessions.update(id, { name, updatedAt: new Date() })
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
    persistFirstExchange,
    updateCurrentSession,
    loadSession,
    startNewSession,
    renameSession,
    deleteSession,
  }
}
