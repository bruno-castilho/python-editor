import { Editor } from '@/components/Editor'
import { Markdown } from '@/components/Markdown'
import { readFileSync } from 'fs'
import { join } from 'path'

const MAIN_DEFAULT_CONTENT = `# Python Editor\ndef greet(name: str) -> str:\n    """Return a greeting message."""\n    return f"Hello, {name}!"\n\nname = input("Enter your name: ")\n\nprint(greet(name))`

export default function Page() {
  const content = readFileSync(
    join(process.cwd(), 'src/assets/quick-start-editor.md'),
    'utf-8',
  )

  return (
    <>
      <Editor
        initialFiles={[{ name: 'main.py', content: MAIN_DEFAULT_CONTENT }]}
      />
      <Markdown>{content}</Markdown>
    </>
  )
}
