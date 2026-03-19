'use client'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'

import logo from '../../assets/logo-python.svg'
import { UserMenu } from './user-menu'
import { PageMenu } from './page-menu'
import { getAccessToken } from '@/utils/access-token-store'
import { GuestMenu } from './guest-menu'

export function Header() {
  const accessToken = getAccessToken()

  return (
    <Box component={AppBar} position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component="img"
            src={logo.src}
            alt="logo"
            height={48}
            display={{ xs: 'none', md: 'flex' }}
            mr={1}
          />
          <PageMenu />
          <Box
            component="img"
            src={logo.src}
            alt="logo"
            height={48}
            display={{ xs: 'flex', md: 'none' }}
            mr={2}
          />
          <Box flexGrow={1} />
          {accessToken && <UserMenu />}
          {!accessToken && <GuestMenu />}
        </Toolbar>
      </Container>
    </Box>
  )
}
