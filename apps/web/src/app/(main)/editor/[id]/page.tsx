import { readFileSync } from 'fs'
import { join } from 'path'
import { EditorPage } from './components/EditorPage'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const markdownContent = readFileSync(
    join(process.cwd(), 'src/assets/quick-start-editor.md'),
    'utf-8',
  )

  return <EditorPage params={params} markdownContent={markdownContent} />
}
