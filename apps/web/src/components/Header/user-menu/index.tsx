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

import { useContext, useState } from 'react'
import { DarkMode, LightMode, Logout, Settings } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { AlertContext } from '@/context/AlertContext'
import { useQuery, useMutation } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { setAccessToken } from '@/utils/access-token-store'

export function UserMenu() {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const { mode, systemMode, setMode } = useColorScheme()
  const alert = useContext(AlertContext)
  const router = useRouter()

  const { data } = useQuery(trpc.users.getProfile.queryOptions())
  const user = data?.user
  const avatarUrl = (user as { avatarUrl?: string | null } | undefined)
    ?.avatarUrl

  const { mutateAsync: signOutMutationAsync, isPending: isPendingSignOut } =
    useMutation(
      trpc.auth.signOut.mutationOptions({
        onSuccess(responseData) {
          alert.success(responseData.message)
        },
        onError(error) {
          alert.error(error.message)
        },
      }),
    )

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  function handleSettings() {
    router.push('/settings/profile')
  }

  function handleChangeMode() {
    setMode(mode === 'dark' || systemMode === 'dark' ? 'light' : 'dark')
    setAnchorElUser(null)
  }

  async function handleSignOut() {
    await signOutMutationAsync()
    setAccessToken(null)
    router.push('/sign-in')
  }

  return (
    <Box flexGrow={0}>
      <Tooltip title="User menu">
        <IconButton
          onClick={handleOpenUserMenu}
          sx={{ p: 0, color: 'text.primary' }}
        >
          <Avatar
            src={avatarUrl ?? undefined}
            alt={user?.name}
            sx={{
              height: 48,
              width: 48,
              border: 2,
              borderColor: 'secondary.main',
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
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography textAlign="center">Settings</Typography>
        </MenuItem>

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

        <MenuItem onClick={handleSignOut} disabled={isPendingSignOut}>
          <ListItemIcon>
            <Logout fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography textAlign="center">Sign out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}
