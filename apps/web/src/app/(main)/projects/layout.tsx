'use client'

import { OnlyUserPage } from '@/permissions/onlyUserPage'
import { Box, Card, Tab, Tabs } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const currentTab = (() => {
    if (pathname.includes('/personal')) return 0
    if (pathname.includes('/shared-with-me')) return 1
    return 0
  })()

  return (
    <OnlyUserPage>
      <Box component={Card} variant="outlined" mt={2}>
        <Tabs value={currentTab}>
          <Tab
            label="Personal"
            onClick={() => router.push('/projects/personal')}
          />
          <Tab
            label="Shared With Me"
            onClick={() => router.push('/projects/shared-with-me')}
          />
        </Tabs>

        {children}
      </Box>
    </OnlyUserPage>
  )
}
