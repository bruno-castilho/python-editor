import { EditorContext } from '@/context/EditorContext'
import { useContext } from 'react'

export function useEditor() {
  return useContext(EditorContext)
}
