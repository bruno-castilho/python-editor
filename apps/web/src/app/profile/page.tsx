'use client'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { trpc } from '@/utils/trpc'
import { Edit } from '@mui/icons-material'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  IconButton,
  TextField,
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

export default function Page() {
  const alert = useContext(AlertContext)

  const queryClient = useQueryClient()
  const { data, isPending } = useQuery(trpc.users.getProfile.queryOptions())

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

  const { mutateAsync, isPending: isMutating } = useMutation(
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
      onError(err) {
        alert.error(err.message)
      },
    }),
  )

  async function handleSubmitForm(data: UpdateUserDTO) {
    await mutateAsync(data)
  }
  return (
    <DefaultLayout>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80dvh"
      >
        <Box
          variant="outlined"
          component={Card}
          width={{ xs: 350, sm: 450 }}
          padding={4}
          gap={2}
          overflow="auto"
        >
          <Box display="flex" justifyContent="center">
            <Badge
              overlap="circular"
              badgeContent={
                <>
                  <IconButton
                    size="large"
                    sx={{ p: 0, color: 'text.secondary' }}
                  >
                    <Edit fontSize="large" />
                  </IconButton>
                </>
              }
            >
              <Avatar
                alt={user?.name}
                sx={{
                  width: 128,
                  height: 128,
                  fontSize: 64,
                }}
              />
            </Badge>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit(handleSubmitForm)}
            display="flex"
            flexDirection="column"
            width="100%"
            gap={2}
          >
            <FormControl>
              <FormLabel htmlFor="name">First name</FormLabel>
              <TextField
                size="small"
                id="name"
                type="name"
                autoFocus
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
                autoFocus
                fullWidth
                variant="outlined"
                error={!!errors.lastName}
                helperText={errors.lastName?.message ?? ''}
                {...register('lastName')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                size="small"
                id="email"
                type="email"
                placeholder="your@email.com"
                autoFocus
                fullWidth
                variant="outlined"
                disabled
                defaultValue={user?.email}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="newPassword">New password</FormLabel>
              <TextField
                size="small"
                placeholder="••••••"
                type="password"
                id="newPassword"
                autoFocus
                fullWidth
                variant="outlined"
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message ?? ''}
                {...register('newPassword')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="repeatPassword">
                Repeat new password
              </FormLabel>
              <TextField
                size="small"
                placeholder="••••••"
                type="password"
                id="repeatPassword"
                autoFocus
                fullWidth
                variant="outlined"
                error={!!errors.repeatPassword}
                helperText={errors.repeatPassword?.message ?? ''}
                {...register('repeatPassword')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                size="small"
                placeholder="••••••"
                type="password"
                id="password"
                autoFocus
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
              fullWidth
              variant="contained"
              disabled={isPending || isMutating}
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Box>
    </DefaultLayout>
  )
}
