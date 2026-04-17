'use client'

import Image from 'next/image'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import logoBw from '@/assets/logo-bw.svg'

export default function NotFound() {
  return (
    <Box
      component="main"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={3}
      sx={{ bgcolor: 'background.default', textAlign: 'center', px: 2 }}
    >
      <Image src={logoBw} alt="Logo" height={300} priority />

      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="h5" color="text.disabled">
            404
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h5" fontWeight={600}>
            Page not found
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>
      </Box>

      <Button
        component={Link}
        href="/"
        variant="text"
        size="large"
        startIcon={<ArrowBackRounded />}
        sx={(theme) => ({
          px: 4,
          color:
            theme.palette.mode === 'light'
              ? theme.palette.primary.main
              : theme.palette.secondary.main,
        })}
      >
        Back to home
      </Button>
    </Box>
  )
}
