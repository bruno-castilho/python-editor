'use client'

import { usePathname } from 'next/navigation'
import NextLink from 'next/link'
import {
  AccountCircle as AccountCircleIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material'
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { OnlyUserPage } from '@/permissions/onlyUserPage'

const navItems = [
  {
    label: 'Profile',
    href: '/settings/profile' as const,
    icon: <AccountCircleIcon />,
  },
  {
    label: 'Sessions',
    href: '/settings/sessions' as const,
    icon: <DevicesIcon />,
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <OnlyUserPage>
      <Box
        width="100%"
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        mt={2}
      >
        <Box component="nav" sx={{ minWidth: { md: 200 } }}>
          <List disablePadding>
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <ListItem key={item.href} disablePadding>
                  <NextLink
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      width: '100%',
                    }}
                  >
                    <ListItemButton selected={active} sx={{ borderRadius: 1 }}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </NextLink>
                </ListItem>
              )
            })}
          </List>
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }}
        />
        <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 2 }} />

        <Box flex={1}>{children}</Box>
      </Box>
    </OnlyUserPage>
  )
}
