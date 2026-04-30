'use client'
import {
  Avatar,
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type RegisterUserDTO,
  registerUserSchema,
} from '@python-editor/schemas/register-user'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc'
import { useContext } from 'react'
import { AlertContext } from '@/context/AlertContext'
import { PersonAdd } from '@mui/icons-material'

export default function Page() {
  const router = useRouter()
  const alert = useContext(AlertContext)

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<RegisterUserDTO>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      repeatPassword: '',
    },
  })

  const { mutate: registerUserMutate, isPending: isPendingRegisterUser } =
    useMutation(
      trpc.users.registerUser.mutationOptions({
        onSuccess({ message }) {
          reset()
          alert.success(message)
        },
        onError(error) {
          alert.error(
            error instanceof Error ? error.message : 'Error creating account',
          )
        },
      }),
    )

  async function handleSubmitForm(data: RegisterUserDTO) {
    registerUserMutate(data)
  }

  function handleDoSignIn() {
    router.push('/sign-in')
  }

  return (
    <Box
      variant="outlined"
      component={Card}
      sx={{
        width: {
          xs: 350,
          sm: 450,
        },
        p: 4,
        gap: 2,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        mb={2}
      >
        <Avatar
          sx={(theme) => ({
            bgcolor: theme.palette.secondary.main,
          })}
        >
          <PersonAdd />
        </Avatar>

        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
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
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                id="name"
                type="text"
                autoFocus
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message ?? ''}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="lastName">Last name</FormLabel>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                id="lastName"
                type="text"
                fullWidth
                variant="outlined"
                error={!!errors.lastName}
                helperText={errors.lastName?.message ?? ''}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                id="email"
                type="email"
                placeholder="your@email.com"
                fullWidth
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message ?? ''}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                placeholder="••••••"
                type="password"
                id="password"
                fullWidth
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message ?? ''}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="repeatPassword">Repeat password</FormLabel>
          <Controller
            name="repeatPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                placeholder="••••••"
                type="password"
                id="repeatPassword"
                fullWidth
                variant="outlined"
                error={!!errors.repeatPassword}
                helperText={errors.repeatPassword?.message ?? ''}
              />
            )}
          />
        </FormControl>
        <Button
          type="submit"
          size="small"
          fullWidth
          variant="contained"
          loading={isSubmitting || isPendingRegisterUser}
          loadingPosition="start"
        >
          CREATE
        </Button>
        <Button
          type="button"
          size="small"
          fullWidth
          variant="contained"
          color="secondary"
          onClick={handleDoSignIn}
        >
          SIGN IN
        </Button>
      </Box>
    </Box>
  )
}
