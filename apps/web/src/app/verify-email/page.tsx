import { Avatar, Box, Button, Card, Typography } from '@mui/material'
import { Verified } from '@mui/icons-material'
import { TRPCClientError } from '@trpc/client'
import NextLink from 'next/link'
import { AppError } from '@/errors/app-error'
import { trpcServer } from '@/utils/trpc-server'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token)
    throw new AppError('Verification token not found in the URL.', 400)

  try {
    await trpcServer.users.verifyEmail.mutate({ token })
  } catch (error) {
    if (error instanceof TRPCClientError) {
      throw new AppError(error.message, error.data?.httpStatus ?? 500)
    }
    throw error
  }

  return (
    <Box
      component="main"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        variant="outlined"
        component={Card}
        display="flex"
        flexDirection="column"
        alignItems="center"
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
            <Verified />
          </Avatar>

          <Typography component="h1" variant="h5">
            Verified successfully!
          </Typography>
        </Box>

        <Typography textAlign="center" color="text.secondary">
          Your account is active. You can now sign in.
        </Typography>
        <Button
          variant="contained"
          fullWidth
          component={NextLink}
          href="/sign-in"
        >
          Sign in
        </Button>
      </Box>
    </Box>
  )
}
