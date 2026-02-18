'use client'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Link as LinkMUI,
  Card,
} from '@mui/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type LoginDTO, loginSchema } from '@python-editor/schemas/login'
import Link from 'next/link'
import { useContext } from 'react'
import { AlertContext } from '@/context/AlertContext'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { useRouter } from 'next/navigation'

export function LoginCard() {
  const router = useRouter()
  const alert = useContext(AlertContext)
  const { mutateAsync } = useMutation(trpc.auth.login.mutationOptions())

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
  })

  async function handleSubmitForm(data: LoginDTO) {
    try {
      const { message } = await mutateAsync(data)
      reset()
      alert.success(message)
      router.push('/')
    } catch (e) {
      console.log(e)
      alert.error(e instanceof Error ? e.message : 'Erro ao fazer login')
    }
  }

  return (
    <Box
      variant="outlined"
      component={Card}
      maxWidth={450}
      minWidth={300}
      padding={4}
      gap={2}
    >
      <Typography component="h1" variant="h4">
        Fazer login
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

        <Button
          type="submit"
          size="small"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          color="secondary"
        >
          Entrar
        </Button>
        <LinkMUI
          component="button"
          type="button"
          variant="body2"
          alignSelf="center"
          color="primary"
        >
          Esqueceu sua senha?
        </LinkMUI>
      </Box>
      <Divider>ou</Divider>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography textAlign="center">
          Não tem uma conta?{' '}
          <LinkMUI
            variant="body2"
            textAlign="center"
            component={Link}
            href="/register"
            color="primary"
          >
            Inscrever-se
          </LinkMUI>
        </Typography>
      </Box>
    </Box>
  )
}
