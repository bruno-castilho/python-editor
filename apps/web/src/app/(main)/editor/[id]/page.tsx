'use client'
import { use } from 'react'
import JSZip from 'jszip'
import { useQuery } from '@tanstack/react-query'
import { Editor, type InitialFiles } from '@/components/Editor'
import { downloadProject } from '@/api/server/download-project'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const { id } = use(params)

  const { data: initialFiles } = useQuery({
    queryKey: ['project', id],
    queryFn: async (): Promise<InitialFiles | null> => {
      const arrayBuffer = await downloadProject(id)

      const zip = await JSZip.loadAsync(arrayBuffer)
      const fileNames = Object.keys(zip.files).filter(
        (name) => !zip.files[name]!.dir,
      )

      const allPy = fileNames.every((name) => name.endsWith('.py'))
      if (!allPy) {
        alert('Invalid project: all files must be .py files.')
        return null
      }

      const mainFileName = fileNames.find((name) => name === 'main.py')
      if (!mainFileName) {
        alert('Invalid project: main.py is required.')
        return null
      }

      const extractedFiles = await Promise.all(
        fileNames.map(async (name) => ({
          name,
          content: await zip.files[name]!.async('string'),
        })),
      )

      const mainFile = extractedFiles.find((file) => file.name === 'main.py')!
      const otherFiles = extractedFiles.filter(
        (file) => file.name !== 'main.py',
      )

      return [{ name: 'main.py', content: mainFile.content }, ...otherFiles]
    },
    retry: false,
    throwOnError: true,
  })

  if (!initialFiles) return <div>Loading project...</div>

  return <Editor initialFiles={initialFiles} />
}
