// ChatWindow.jsx
import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import MessageBubble from './MessageBubble'
import ProductCard from './ProductCard'
import TypingIndicator from './TypingIndicator'

/**
 * Chat window displaying all messages and loading indicator.
 * Renders user/assistant bubbles, image previews, and product cards.
 */
export default function ChatWindow({ messages, loading, onImageLoad }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 800,
        mx: 'auto',
      }}
    >
      {messages.map((msg, i) => {
        // Product card
        if (msg.product) {
          return <ProductCard key={'prod-' + i} {...msg.product} />
        }
        // Image preview
        if (typeof msg.content === 'object' && msg.content?.image) {
          return (
            <MessageBubble
              key={'img-' + i}
              role={msg.role || 'user'}
              content={{ image: msg.content.image }}
              onImageLoad={onImageLoad} 
            />
          )
        }
        // Standard message
        return (
          <MessageBubble
            key={'msg-' + i}
            role={msg.role}
            content={msg.content}
            onImageLoad={onImageLoad} 
          />
        )
      })}

      {/* Typing indicator (shows when loading) */}
      {loading && <TypingIndicator />}
    </Box>
  )
}
