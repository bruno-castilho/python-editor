'use client'
import { Delete } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type ShareProjectDTO,
  shareProjectSchema,
} from '@python-editor/schemas/share-project'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import type { AppRouter } from '@python-editor/api/routers/index'
import type { inferRouterOutputs } from '@trpc/server'

type RouterOutputs = inferRouterOutputs<AppRouter>
type PersonalProjectsData = RouterOutputs['projects']['findPersonalProjects']

interface ShareProjectDialogProps {
  open: boolean
  handleClose: () => void
  project: {
    id: string
    name: string
    updatedBy: {
      email: string
    }
    updatedAt: string
    sharedWith: {
      avatarUrl: string | null
      id: string
      name: string
      lastName: string
      email: string
    }[]
  }
}

export function ShareProjectDialog({
  open,
  handleClose,
  project,
}: ShareProjectDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShareProjectDTO>({
    resolver: zodResolver(shareProjectSchema),
    defaultValues: { projectId: project.id },
  })

  const queryClient = useQueryClient()

  const { mutate: shareProjectMutate, isPending: isPendingShareProject } =
    useMutation(
      trpc.projects.shareProject.mutationOptions({
        onSuccess({ sharedUser }) {
          queryClient.setQueriesData<PersonalProjectsData>(
            { queryKey: trpc.projects.findPersonalProjects.queryKey() },
            (cachedData) => {
              if (!cachedData) return cachedData
              return {
                ...cachedData,
                projects: cachedData.projects.map((cachedProject) =>
                  cachedProject.id === project.id
                    ? {
                        ...cachedProject,
                        sharedWith: [...cachedProject.sharedWith, sharedUser],
                      }
                    : cachedProject,
                ),
              }
            },
          )
        },
      }),
    )

  const { mutate: unshareProjectMutate, isPending: isPendingUnshareProject } =
    useMutation(
      trpc.projects.unshareProject.mutationOptions({
        onSuccess(_, { email }) {
          queryClient.setQueriesData<PersonalProjectsData>(
            { queryKey: trpc.projects.findPersonalProjects.queryKey() },
            (cachedData) => {
              if (!cachedData) return cachedData
              return {
                ...cachedData,
                projects: cachedData.projects.map((cachedProject) =>
                  cachedProject.id === project.id
                    ? {
                        ...cachedProject,
                        sharedWith: cachedProject.sharedWith.filter(
                          (sharedUser) => sharedUser.email !== email,
                        ),
                      }
                    : cachedProject,
                ),
              }
            },
          )
        },
      }),
    )

  function handleShare(data: ShareProjectDTO) {
    shareProjectMutate({ projectId: project.id, email: data.email })
    reset({ projectId: project.id })
  }

  function handleUnshare(email: string) {
    unshareProjectMutate({ projectId: project.id, email })
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>
        Share
        <DialogContentText id="alert-dialog-description">
          Share and control who can access your file.
        </DialogContentText>
      </DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          gap={1}
          width="100%"
          component="form"
          onSubmit={handleSubmit(handleShare)}
        >
          <TextField
            autoFocus
            id="email"
            label="Email"
            placeholder="Email"
            type="email"
            fullWidth
            size="small"
            error={!!errors.email}
            helperText={errors.email?.message ?? ''}
            {...register('email')}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={isPendingShareProject}
          >
            Invite
          </Button>
        </Box>
        <List>
          {project.sharedWith.map(
            ({ id, name, lastName, avatarUrl, email }) => (
              <ListItem
                key={id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="primary"
                    disabled={isPendingUnshareProject}
                    onClick={() => handleUnshare(email)}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar alt={name} src={avatarUrl ?? ''} variant="rounded" />
                </ListItemAvatar>
                <ListItemText
                  primary={`${name} ${lastName}`}
                  secondary={email}
                />
              </ListItem>
            ),
          )}
        </List>
      </DialogContent>
    </Dialog>
  )
}
