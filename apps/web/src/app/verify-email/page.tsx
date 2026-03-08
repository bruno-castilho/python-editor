'use client'
import { Box, Button, Card, CircularProgress, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trpc } from '@/utils/trpc'

type Status = 'loading' | 'success' | 'error'

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const { mutateAsync: verifyEmail } = useMutation(
    trpc.user.verifyEmail.mutationOptions(),
  )

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Token de verificação não encontrado na URL.')
      return
    }

    verifyEmail({ token })
      .then(() => setStatus('success'))
      .catch((e) => {
        setStatus('error')
        setErrorMessage(
          e instanceof Error ? e.message : 'Erro ao verificar e-mail.',
        )
      })
  }, [token])

  return (
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
        width={{ xs: 300, sm: 400 }}
        padding={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
      >
        {status === 'loading' && (
          <>
            <CircularProgress />
            <Typography>Verificando seu e-mail...</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Typography component="h1" variant="h5" textAlign="center">
              E-mail verificado com sucesso!
            </Typography>
            <Typography textAlign="center" color="text.secondary">
              Sua conta está ativa. Agora você pode fazer login.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push('/login')}
            >
              Fazer login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Typography component="h1" variant="h5" textAlign="center">
              Link inválido ou expirado
            </Typography>
            <Typography textAlign="center" color="text.secondary">
              {errorMessage}
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push('/login')}
            >
              Voltar ao login
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
