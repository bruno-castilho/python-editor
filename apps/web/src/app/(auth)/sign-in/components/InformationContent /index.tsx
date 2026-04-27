import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  InfoRounded,
  LocalLibraryRounded,
  ConstructionRounded,
} from '@mui/icons-material'

import Image from 'next/image'
import logo from '../../../../../assets/logo.svg'

export function InformationContent() {
  return (
    <Stack flexDirection="column" gap={4} maxWidth={450} minWidth={300}>
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" justifyContent="center">
          <Image src={logo} alt="ufsc logo" height={96} />
        </Box>
        <Box display="flex" justifyContent="center">
          <Typography variant="h6" component="h1">
            Project Information
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" gap={2}>
        <InfoRounded />
        <Box>
          <Typography gutterBottom fontWeight="medium">
            About the Project
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A collaborative, browser-based Python development environment where
            students and developers can write, manage, and share multi-file
            Python projects — with no local setup required.
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" gap={2}>
        <ConstructionRounded />
        <Box>
          <Typography gutterBottom fontWeight="medium">
            Objectives
          </Typography>
          <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
            {[
              'Provide an accessible in-browser Python editor with multi-file project support',
              'Allow users to save, load, and manage their Python projects',
              'Enable team collaboration through project sharing between users',
              'Offer an integrated AI assistant to support code writing and debugging',
            ].map((objective) => (
              <Typography
                key={objective}
                component="li"
                variant="body2"
                color="text.secondary"
              >
                {objective}
              </Typography>
            ))}
          </Box>
        </Box>
      </Stack>

      <Stack direction="row" gap={2}>
        <LocalLibraryRounded />
        <Box>
          <Typography gutterBottom fontWeight="medium">
            Repository
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            component="a"
            href="https://github.com/bruno-castilho/python-editor"
            target="_blank"
            rel="noopener noreferrer"
            fontWeight="medium"
            sx={{
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            GitHub Project
          </Typography>
        </Box>
      </Stack>
    </Stack>
  )
}
