import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  InfoRounded,
  LocalLibraryRounded,
  ConstructionRounded,
} from '@mui/icons-material'

import Image from 'next/image'
import logo from '../../../../../assets/logo-python.svg'

export function InformationContent() {
  return (
    <Stack
      flexDirection="column"
      alignSelf="center"
      gap={4}
      maxWidth={450}
      minWidth={300}
    >
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" justifyContent="center">
          <Image src={logo} alt="ufsc logo" height={48} />
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
            Add description
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" gap={2}>
        <ConstructionRounded />
        <Box>
          <Typography gutterBottom fontWeight="medium">
            Objectives
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add objectives
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" gap={2}>
        <LocalLibraryRounded />
        <Box>
          <Typography gutterBottom fontWeight="medium">
            Repository
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Project GitHub
          </Typography>
        </Box>
      </Stack>
    </Stack>
  )
}
