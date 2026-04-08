import { useAuthOpenRouter } from '@/hooks/useAuthOpenRouter'
import { Box, Button, Typography } from '@mui/material'

export function ChatAgentAuth() {
  const { startOpenRouterAuth } = useAuthOpenRouter()

  async function handleAuthenticate() {
    await startOpenRouterAuth()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        flex: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Authenticate with OpenRouter to start chatting with AI models.
      </Typography>
      <Button variant="contained" onClick={handleAuthenticate}>
        Authenticate with OpenRouter
      </Button>
    </Box>
  )
}
