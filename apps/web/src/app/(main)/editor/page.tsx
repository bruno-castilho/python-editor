import { Editor } from '@/components/Editor'

const MAIN_DEFAULT_CONTENT = `# Python Editor\ndef greet(name: str) -> str:\n    """Return a greeting message."""\n    return f"Hello, {name}!"\n\nname = input("Enter your name: ")\n\nprint(greet(name))`

export default function Page() {
  return (
    <Editor
      initialFiles={[{ name: 'main.py', content: MAIN_DEFAULT_CONTENT }]}
    />
  )
}
