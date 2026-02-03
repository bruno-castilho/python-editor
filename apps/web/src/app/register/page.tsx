'use client'
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type RegisterUserDTO,
  RegisterUserSchema,
} from '@python-editor/schemas/register-user'

export default function Page() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<RegisterUserDTO>({
    resolver: zodResolver(RegisterUserSchema),
  })

  async function handleSubmitForm(data: RegisterUserDTO) {
    console.log(data)
    reset()
  }

  function handleDoLogin() {}

  return (
    <Box>
      <Box
        component="main"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding={2}
      >
        <Box
          variant="outlined"
          component={Card}
          width={{
            xs: 300,
            sm: 400,
            md: 500,
          }}
          padding={4}
          gap={2}
        >
          <Typography component="h1" variant="h4">
            Criar conta
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(handleSubmitForm)}
            display="flex"
            flexDirection="column"
            width="100%"
            gap={2}
          >
            <FormControl>
              <FormLabel htmlFor="name">Nome</FormLabel>
              <TextField
                size="small"
                id="name"
                type="name"
                autoFocus
                required
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message ?? ''}
                {...register('name')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="lastName">Sobrenome</FormLabel>
              <TextField
                size="small"
                id="lastName"
                type="lastName"
                autoFocus
                required
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
                placeholder="seu@email.com"
                autoFocus
                required
                fullWidth
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message ?? ''}
                {...register('email')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <TextField
                size="small"
                placeholder="••••••"
                type="password"
                id="password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message ?? ''}
                {...register('password')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="repeatPassword">Repetir senha</FormLabel>
              <TextField
                size="small"
                placeholder="••••••"
                type="password"
                id="repeatPassword"
                autoFocus
                required
                fullWidth
                variant="outlined"
                error={!!errors.repeatPassword}
                helperText={errors.repeatPassword?.message ?? ''}
                {...register('repeatPassword')}
              />
            </FormControl>
            <Button
              type="submit"
              size="small"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
            >
              CRIAR
            </Button>
            <Button
              type="submit"
              size="small"
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleDoLogin}
            >
              FAZER LOGIN
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
