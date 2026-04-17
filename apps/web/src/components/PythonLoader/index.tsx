'use client'
import Box from '@mui/material/Box'

import codeSvg from '@/assets/code.svg'
import pythonSvg from '@/assets/python.svg'

interface PythonLoaderProps {
  size?: number
}

export function PythonLoader({ size = 96 }: PythonLoaderProps) {
  return (
    <Box position="relative" width={size} height={size}>
      <Box
        component="img"
        src={pythonSvg.src}
        alt="python"
        width={size}
        height={size}
        sx={{
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />
      <Box
        component="img"
        src={codeSvg.src}
        alt="code"
        sx={{
          width: size / 1.42,
          height: size / 1.42,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </Box>
  )
}
