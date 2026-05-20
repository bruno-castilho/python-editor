'use client'
import { use } from 'react'
import JSZip from 'jszip'
import { useQuery } from '@tanstack/react-query'
import { Editor, type InitialFiles } from '@/components/Editor'
import { downloadProject } from '@/api/server/download-project'
import { AppError } from '@/errors/app-error'
import axios from 'axios'
import { Loading } from '@/components/Loading'
import { Box } from '@mui/material'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const { id } = use(params)

  const {
    data: projectData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: async (): Promise<{
      files: InitialFiles
      projectName: string
    } | null> => {
      const { arrayBuffer, projectName } = await downloadProject(id)

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

      return {
        files: [{ name: 'main.py', content: mainFile.content }, ...otherFiles],
        projectName,
      }
    },
  })

  if (isLoading)
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loading
          messagesTitle="Loading your project..."
          loadingMessages={[
            'Fetching project files...',
            'Downloading source code...',
            'Extracting files from archive...',
            'Validating Python files...',
            'Preparing the editor...',
            'Almost ready...',
          ]}
        />
      </Box>
    )

  if (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500
      throw new AppError(error.message, statusCode)
    }

    throw error
  }

  if (!projectData) throw new Error()

  return (
    <Editor
      initialFiles={projectData.files}
      project={{ id, name: projectData.projectName }}
    />
  )
}
