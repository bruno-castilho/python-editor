'use client'
import { Divider, Stack } from '@mui/material'
import { InformationContent } from './components/InformationContent '
import { SignInCard } from './components/SignInCard'

export default function Page() {
  return (
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
      <SignInCard />
    </Stack>
  )
}
