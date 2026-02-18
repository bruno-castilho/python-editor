'use client'
import { Box, Divider, Stack } from '@mui/material'
import { InformationContent } from './components/InformationContent '
import { LoginCard } from './components/LoginCard'

export default function Page() {
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          divider={
            <>
              <Divider orientation="vertical" flexItem />
              <Divider orientation="horizontal" flexItem />
            </>
          }
          spacing={4}
        >
          <InformationContent />
          <LoginCard />
        </Stack>
      </Box>
    </Box>
  )
}
