// MessageBubble.jsx
import React from 'react'
import { Box, Avatar, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { SmartToy as RobotIcon, Person as UserIcon } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'

/**
 * Single message bubble, renders user/assistant messages and images.
 * Assistant supports markdown; user uses plain text.
 */
export default function MessageBubble({ role, content }) {
  const theme = useTheme()
  const isUser = role === 'user'

  // Dynamic color for user/assistant
  const userBg = theme.palette.primary.main
  const userColor = theme.palette.primary.contrastText
  const assistantBg = theme.palette.background.paper
  const assistantColor = theme.palette.text.primary

  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      mb={1}
      px={1}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <Avatar sx={{ bgcolor: theme.palette.grey[500] }}>
          <RobotIcon />
        </Avatar>
      )}

      {/* Message bubble (image, markdown, or plain) */}
      <Box
        sx={{
          maxWidth: '70%',
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: isUser ? userBg : assistantBg,
          color: isUser ? userColor : assistantColor,
          fontSize: 18,
        }}
      >
        {typeof content === 'object' && content?.image ? (
          <img
            src={content.image}
            alt={isUser ? "uploaded by user" : "uploaded by assistant"}
            style={{
              display: 'block',
              maxWidth: 220,
              maxHeight: 220,
              borderRadius: 8,
              objectFit: 'cover',
            }}
          />
        ) : isUser ? (
          <Typography variant="body2">{content}</Typography>
        ) : (
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }} {...props} />,
              h2: ({node, ...props}) => <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }} {...props} />,
              h3: ({node, ...props}) => <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginLeft: 12, marginBottom: 2 }} {...props} />,
              strong: ({node, ...props}) => <strong style={{ fontWeight: 700 }} {...props} />,
              p: ({node, ...props}) => <Typography variant="body2" paragraph sx={{ mb: 1 }} {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </Box>

      {/* User avatar */}
      {isUser && (
        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
          <UserIcon />
        </Avatar>
      )}
    </Stack>
  )
}
