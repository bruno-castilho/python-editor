import Dexie, { type EntityTable } from 'dexie'
import type { ChatMessage } from '@/hooks/useOpenRouter'

export interface ChatSession {
  id: string
  name: string
  messages: ChatMessage[]
  model: string
  createdAt: Date
  updatedAt: Date
}

class ChatSessionsDb extends Dexie {
  sessions!: EntityTable<ChatSession, 'id'>

  constructor() {
    super('chat-sessions')
    this.version(1).stores({
      sessions: 'id, name, createdAt, updatedAt',
    })
  }
}

export const db = new ChatSessionsDb()

export function generateSessionName(firstUserMessage: string): string {
  return firstUserMessage.trim().slice(0, 50)
}
