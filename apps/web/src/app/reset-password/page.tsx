import { Avatar, Box, Card, Typography } from '@mui/material'
import { AppError } from '@/errors/app-error'
import { LockReset } from '@mui/icons-material'
import { ResetPasswordForm } from './components/ResetPasswordForm'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token)
    throw new AppError('The reset token was not found in the URL.', 400)

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
            <LockReset />
          </Avatar>

          <Typography component="h1" variant="h5">
            Reset password
          </Typography>
        </Box>

        <ResetPasswordForm token={token} />
      </Box>
    </Box>
  )
}
