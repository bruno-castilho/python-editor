'use client'
import { trpc } from '@/utils/trpc'
import { Edit } from '@mui/icons-material'
import {
  Avatar,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  type UpdateUserDTO,
  updateUserSchema,
} from '@python-editor/schemas/update-user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext } from 'react'
import { AlertContext } from '@/context/AlertContext'
import { uploadAvatarSchema } from '@python-editor/schemas/upload-avatar'

import { uploadAvatar } from '@/api/upload-avatar'
import axios from 'axios'
import { ZodError } from 'zod'

export default function Page() {
  const { data, isPending: isPendingGetProfile } = useQuery(
    trpc.users.getProfile.queryOptions(),
  )
  const user = data?.user

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserDTO>({
    resolver: zodResolver(updateUserSchema),
    values: {
      name: user?.name ?? '',
      lastName: user?.lastName ?? '',
      password: '',
      newPassword: '',
      repeatPassword: '',
    },
  })

  const alert = useContext(AlertContext)
  const queryClient = useQueryClient()

  const {
    mutateAsync: updateProfileMutateAsync,
    isPending: isPendingUpdateProfile,
  } = useMutation(
    trpc.users.updateProfile.mutationOptions({
      onSuccess(responseData, formData) {
        const queryKey = trpc.users.getProfile.queryKey()
        queryClient.setQueryData(queryKey, (currentData) => {
          if (!currentData?.user) return currentData
          return {
            user: {
              ...currentData.user,
              name: formData.name,
              lastName: formData.lastName,
            },
          }
        })

        alert.success(responseData.message)
      },
      onError(error) {
        alert.error(error.message)
      },
    }),
  )

  async function handleSubmitProfileForm(data: UpdateUserDTO) {
    await updateProfileMutateAsync(data)
  }

  const {
    mutateAsync: uploadAvatarMutateAsync,
    isPending: isPendingUploadAvatar,
  } = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (responseData) => {
      const { avatarUrl, message } = responseData

      const queryKey = trpc.users.getProfile.queryKey()
      queryClient.setQueryData(queryKey, (currentData) => {
        if (!currentData?.user) return currentData
        return {
          user: {
            ...currentData.user,
            avatarUrl,
          },
        }
      })

      alert.success(message)
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data.msg) {
        const { message } = error.response.data
        alert.error(message)
        return
      }

      alert.error('Something went wrong')
    },
  })

  async function handleUploadAvatar(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      uploadAvatarSchema.parse({
        contentType: file.type,
        fileSize: file.size,
      })

      await uploadAvatarMutateAsync({ file })
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message
        alert.error(message ?? 'Invalid file')
        return
      }

      alert.error('Something went wrong')
    }
  }

  const {
    mutateAsync: removeAvatarMutateAsync,
    isPending: isPendingRemoveAvatar,
  } = useMutation(
    trpc.users.removeAvatar.mutationOptions({
      onSuccess(responseData) {
        const queryKey = trpc.users.getProfile.queryKey()
        queryClient.setQueryData(queryKey, (currentData) => {
          if (!currentData?.user) return currentData
          return {
            user: {
              ...currentData.user,
              avatarUrl: null,
            },
          }
        })

        alert.success(responseData.message)
      },
      onError(error) {
        alert.error(error.message)
      },
    }),
  )

  async function handleRemoveAvatar() {
    await removeAvatarMutateAsync()
  }

  return (
    <>
      <Typography variant="h5" mb={1}>
        Profile
      </Typography>

      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        alignItems="flex-start"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
          alignSelf="stretch"
        >
          <Badge
            overlap="circular"
            badgeContent={
              <IconButton
                component="label"
                size="large"
                sx={{ p: 0, color: 'text.secondary' }}
                disabled={isPendingUploadAvatar}
              >
                <Edit fontSize="large" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={handleUploadAvatar}
                />
              </IconButton>
            }
          >
            <Avatar
              src={user?.avatarUrl || ''}
              alt={user?.name}
              sx={{
                width: 256,
                height: 256,
                fontSize: 64,
                border: 3,
                borderColor: 'secondary.main',
              }}
            />
          </Badge>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleRemoveAvatar}
            disabled={!user?.avatarUrl || isPendingRemoveAvatar}
          >
            Remove Avatar
          </Button>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(handleSubmitProfileForm)}
          display="flex"
          flexDirection="column"
          flex={1}
          width="100%"
          gap={2}
          mb={2}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              size="small"
              id="email"
              type="email"
              placeholder="your@email.com"
              fullWidth
              variant="outlined"
              disabled
              defaultValue={user?.email}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="name">First name</FormLabel>
            <TextField
              size="small"
              id="name"
              type="name"
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name?.message ?? ''}
              {...register('name')}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="lastName">Last name</FormLabel>
            <TextField
              size="small"
              id="lastName"
              type="lastName"
              fullWidth
              variant="outlined"
              error={!!errors.lastName}
              helperText={errors.lastName?.message ?? ''}
              {...register('lastName')}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="newPassword">New password</FormLabel>
            <TextField
              size="small"
              placeholder="••••••"
              type="password"
              id="newPassword"
              fullWidth
              variant="outlined"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message ?? ''}
              {...register('newPassword')}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="repeatPassword">Repeat new password</FormLabel>
            <TextField
              size="small"
              placeholder="••••••"
              type="password"
              id="repeatPassword"
              fullWidth
              variant="outlined"
              error={!!errors.repeatPassword}
              helperText={errors.repeatPassword?.message ?? ''}
              {...register('repeatPassword')}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Current password</FormLabel>
            <TextField
              size="small"
              placeholder="••••••"
              type="password"
              id="password"
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message ?? ''}
              {...register('password')}
            />
          </FormControl>
          <Button
            type="submit"
            size="small"
            variant="contained"
            disabled={isPendingGetProfile || isPendingUpdateProfile}
            sx={{ alignSelf: 'flex-start' }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </>
  )
}
