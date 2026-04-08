'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import JSZip from 'jszip'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { uploadProject } from '@/api/server/upload-project'
import { AlertContext } from '@/context/AlertContext'
import type { PythonFile } from '@/hooks/usePyodide'
import { saveProjectSchema, type SaveProjectDTO } from './schema'
import { getAccessToken } from '@/utils/access-token-store'
import { useEditor } from '@/hooks/useEditor'

interface SaveProjectDialogProps {
  open: boolean
  onClose: () => void
}

type UploadStatus = 'idle' | 'uploading' | 'error'

export function SaveProjectDialog({ open, onClose }: SaveProjectDialogProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const { getUpdatedFiles } = useEditor()

  const alert = useContext(AlertContext)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SaveProjectDTO>({
    resolver: zodResolver(saveProjectSchema),
    defaultValues: {
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

  async function saveProjectRemotely(
    filename: string,
    blob: Blob,
  ): Promise<void> {
    await uploadProject({
      file: blob,
      filename,
      onProgress: ({ loaded, total }) => {
        if (total !== undefined) {
          setUploadProgress(Math.round((loaded / total) * 100))
        }
      },
      onComplete: () => {
        alert.success('Project saved successfully.')
        setUploadStatus('idle')
        setUploadProgress(0)
      },
      onError: (message) => {
        alert.error(message)
        setUploadStatus('idle')
        setUploadProgress(0)
      },
    })
  }

  async function saveProjectLocally(
    filename: string,
    blob: Blob,
  ): Promise<void> {
    triggerLocalDownload(blob, filename)
  }

  async function handleFormSubmit(data: SaveProjectDTO): Promise<void> {
    const updatedFiles = getUpdatedFiles()
    if (!updatedFiles) return

    const zipFilename = `${data.projectName}.zip`
    const blob = await buildZipBlob(updatedFiles)

    if (data.saveLocation === 'local') {
      await saveProjectLocally(zipFilename, blob)
      alert.success('Project saved locally.')
    }

    if (data.saveLocation === 'remote') {
      setUploadProgress(0)
      setUploadStatus('uploading')
      await saveProjectRemotely(zipFilename, blob)
    }

    reset()
    onClose()
  }

  function handleClose(): void {
    if (uploadStatus === 'uploading') return
    reset()
    onClose()
  }

  const isUploading = uploadStatus === 'uploading'
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
        {watch('saveLocation') === 'remote' && isUploading && (
          <Box>
            <LinearProgress
              variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'}
              value={uploadProgress}
            />
            <Typography variant="caption">{uploadProgress}%</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} size="small" disabled={isUploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={isSubmitting || isUploading}
          loading={isUploading}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
