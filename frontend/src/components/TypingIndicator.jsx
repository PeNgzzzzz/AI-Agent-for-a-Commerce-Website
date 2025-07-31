// TypingIndicator.jsx
import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

/**
 * Animated indicator shown while assistant is generating a response.
 */
export default function TypingIndicator() {
  return (
    <Box display="flex" alignItems="center" pl={6} py={1}>
      <CircularProgress size={16} sx={{ mr: 1 }} />
      <Typography color="text.secondary" fontSize={16}>
        Assistant is typing...
      </Typography>
    </Box>
  )
}
