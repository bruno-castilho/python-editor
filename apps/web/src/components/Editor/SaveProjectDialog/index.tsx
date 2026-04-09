'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
import JSZip from 'jszip'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { uploadProject } from '@/api/server/upload-project'
import { updateProject } from '@/api/server/update-project'
import { AlertContext } from '@/context/AlertContext'
import type { PythonFile } from '@/hooks/usePyodide'
import { getAccessToken } from '@/utils/access-token-store'
import { useEditor } from '@/hooks/useEditor'
import {
  saveProjectSchema,
  type SaveProjectDTO,
} from '@python-editor/schemas/save-project'
import { useRouter } from 'next/navigation'

interface SaveProjectDialogProps {
  open: boolean
  onClose: () => void
  project?: {
    id: string
    name: string
  }
}

export function SaveProjectDialog({
  open,
  onClose,
  project,
}: SaveProjectDialogProps) {
  const [isPending, setIsPending] = useState<boolean>(false)

  const router = useRouter()
  const { getUpdatedFiles } = useEditor()

  const alert = useContext(AlertContext)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaveProjectDTO>({
    resolver: zodResolver(saveProjectSchema),
    defaultValues: {
      projectName: project?.name ?? '',
      saveLocation: 'local',
    },
  })

  async function buildZipBlob(projectFiles: PythonFile[]): Promise<Blob> {
    const zip = new JSZip()
    for (const file of projectFiles) {
      zip.file(file.name, file.content)
    }
    return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' })
  }

  function triggerLocalDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function createProjectRemotely(filename: string, blob: Blob) {
    try {
      setIsPending(true)
      const { message, project } = await uploadProject({ file: blob, filename })
      router.push(`/editor/${project.id}`)
      alert.success(message)
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : 'Failed to upload project.',
      )
    } finally {
      setIsPending(false)
    }
  }

  async function downloadProject(filename: string, blob: Blob) {
    triggerLocalDownload(blob, filename)
    alert.success('Project saved locally.')
  }

  async function updateProjectRemotely(filename: string, blob: Blob) {
    if (!project) return
    try {
      setIsPending(true)
      const { message } = await updateProject({
        projectId: project.id,
        file: blob,
        filename,
      })
      alert.success(message)
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : 'Failed to update project.',
      )
    } finally {
      setIsPending(false)
    }
  }

  async function handleFormSubmit(data: SaveProjectDTO): Promise<void> {
    const updatedFiles = getUpdatedFiles()
    if (!updatedFiles) return

    const zipFilename = `${data.projectName}.zip`
    const blob = await buildZipBlob(updatedFiles)

    if (data.saveLocation === 'local') {
      await downloadProject(zipFilename, blob)
    }

    if (data.saveLocation === 'remote' && !project) {
      await createProjectRemotely(zipFilename, blob)
    }

    if (data.saveLocation === 'remote' && project) {
      await updateProjectRemotely(zipFilename, blob)
    }

    reset()
    onClose()
  }

  function handleClose(): void {
    if (isPending) return
    reset()
    onClose()
  }

  const isAuthenticated = Boolean(getAccessToken())

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <DialogTitle>Save Project</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Project name"
          placeholder="my-project"
          sx={{ mt: 1 }}
          error={!!errors.projectName}
          helperText={errors.projectName?.message ?? ''}
          {...register('projectName')}
          disabled={!!project}
        />
        <FormControl>
          <Controller
            name="saveLocation"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel
                  value="local"
                  control={<Radio />}
                  label="Save locally"
                />
                <FormControlLabel
                  value="remote"
                  control={<Radio />}
                  label="Save remotely"
                  disabled={!isAuthenticated}
                />
              </RadioGroup>
            )}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} size="small" disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={isSubmitting || isPending}
          loading={isPending}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
