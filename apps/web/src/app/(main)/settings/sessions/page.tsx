'use client'
import { useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { AlertContext } from '@/context/AlertContext'
import { getAccessToken } from '@/utils/access-token-store'
import { Box, Typography, Button, Skeleton, Stack } from '@mui/material'
import ComputerIcon from '@mui/icons-material/Computer'

function getCurrentSessionId(): string | null {
  try {
    const token = getAccessToken()
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]!)) as {
      sessionId?: string
    }
    return payload.sessionId ?? null
  } catch {
    return null
  }
}

export default function Page() {
  const alert = useContext(AlertContext)
  const queryClient = useQueryClient()

  const currentSessionId = getCurrentSessionId()

  const { data, isPending } = useQuery(
    trpc.users.getUserSessions.queryOptions(),
  )

  const {
    mutateAsync: revokeUserSessionMutateAsync,
    variables: mutatingVars,
    isPending: isRemoving,
  } = useMutation(
    trpc.users.revokeUserSession.mutationOptions({
      onSuccess(responseData) {
        queryClient.invalidateQueries({
          queryKey: trpc.users.getUserSessions.queryKey(),
        })
        alert.success(responseData.message)
      },
      onError(error) {
        alert.error(error.message)
      },
    }),
  )

  async function handleRevokeSession(sessionId: string) {
    await revokeUserSessionMutateAsync({ sessionId })
  }

  const sessions = data?.sessions ?? []

  return (
    <Box>
      <Typography variant="h5" mb={1}>
        Sessions
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        This is a list of devices that have logged into your account. Revoke any
        sessions that you do not recognize.
      </Typography>

      <Stack spacing={1}>
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                }}
              >
                <Skeleton variant="rectangular" width={28} height={28} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="30%" />
                </Box>
                <Skeleton variant="rectangular" width={72} height={30} />
              </Box>
            ))
          : sessions.map((session) => {
              const isCurrent = session.sessionId === currentSessionId
              const isRevokingThis =
                isRemoving && mutatingVars?.sessionId === session.sessionId
              const isActive =
                Date.now() - new Date(session.lastAccess).getTime() <
                60 * 60 * 1000 // 1h

              return (
                <Box
                  key={session.sessionId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <ComputerIcon
                    sx={{ color: 'text.secondary', flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {session.location} {session.ip}
                    </Typography>
                    {isActive ? (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            display: 'inline-block',
                          }}
                        />
                        active
                      </Typography>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {new Date(session.lastAccess).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    )}

                    {isCurrent && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Your current session
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {session.device} · {session.browser}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    loading={isRevokingThis}
                    disabled={isRemoving || isCurrent}
                    onClick={() => handleRevokeSession(session.sessionId)}
                  >
                    Revoke
                  </Button>
                </Box>
              )
            })}
      </Stack>
    </Box>
  )
}
