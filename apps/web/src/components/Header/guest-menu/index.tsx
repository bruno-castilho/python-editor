'use client'
import {
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useColorScheme,
} from '@mui/material'
import { DarkMode, LightMode, Logout } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function GuestMenu() {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const { mode, systemMode, setMode } = useColorScheme()
  const router = useRouter()

  function handleOpenUserMenu(event: React.MouseEvent<HTMLElement>) {
    setAnchorElUser(event.currentTarget)
  }

  function handleCloseUserMenu() {
    setAnchorElUser(null)
  }

  function handleChangeMode() {
    setMode(mode === 'dark' || systemMode === 'dark' ? 'light' : 'dark')
    setAnchorElUser(null)
  }

  function handleSignIn() {
    router.push('/sign-in')
  }

  return (
    <Box flexGrow={0}>
      <Tooltip title="Guest menu">
        <IconButton
          onClick={handleOpenUserMenu}
          sx={{ p: 0, color: 'text.primary' }}
        >
          <Avatar
            sx={{
              height: 48,
              width: 48,
            }}
          ></Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {(mode === 'light' || systemMode === 'light') && (
          <MenuItem onClick={handleChangeMode}>
            <ListItemIcon>
              <DarkMode fontSize="small" color="primary" />
            </ListItemIcon>
            <Typography textAlign="center">Enable Dark Mode</Typography>
          </MenuItem>
        )}

        {(mode === 'dark' || systemMode === 'dark') && (
          <MenuItem onClick={handleChangeMode}>
            <ListItemIcon>
              <LightMode fontSize="small" color="primary" />
            </ListItemIcon>
            <Typography textAlign="center">Enable Light Mode</Typography>
          </MenuItem>
        )}

        <MenuItem onClick={handleSignIn}>
          <ListItemIcon>
            <Logout fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography textAlign="center">Sign In</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}
