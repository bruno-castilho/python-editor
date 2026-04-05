import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Code } from './Code'

interface MarkdownProps {
  children: string
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: Code,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
