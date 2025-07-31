// ChatInput.jsx
import React, { useState, useRef } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import StopIcon from '@mui/icons-material/Stop'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

/**
 * Chat input bar for sending text and uploading images.
 * Disables input when the assistant is generating.
 */
export default function ChatInput({
  onSend,
  onUpload,
  disabled,
  isGenerating,
}) {
  const [text, setText] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const menuOpen = Boolean(anchorEl)
  const fileInputRef = useRef()

  // Handles text submit (Enter or send button)
  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled || isGenerating) return
    onSend(trimmed)
    setText('')
  }

  const openMenu = (e) => setAnchorEl(e.currentTarget)
  const closeMenu = () => setAnchorEl(null)

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        position: 'relative',
        pb: 1,
      }}
    >
      <TextField
        multiline
        minRows={2}
        variant="outlined"
        fullWidth
        placeholder="Type your message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            pb: '3rem',
          },
        }}
        // Enter: send; Shift+Enter: newline
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />

      {/* "+" button at bottom-left */}
      <IconButton
        onClick={openMenu}
        disabled={disabled || isGenerating}
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
        }}
      >
        <AddIcon />
      </IconButton>

      {/* Send/Stop button at bottom-right */}
      <IconButton
        type="submit"
        disabled={disabled || isGenerating}
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
        }}
      >
        {isGenerating ? <StopIcon /> : <ArrowUpwardIcon />}
      </IconButton>

      {/* Dropdown menu for image upload */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click()
            closeMenu()
          }}
          disableRipple
        >
          <Tooltip title="Upload an image to find similar products">
            <IconButton
              size="small"
              sx={{ p: 0.5 }}
              disabled={disabled || isGenerating}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MenuItem>
      </Menu>

      {/* Hidden file input, controlled by ref */}
      <input
        ref={fileInputRef}
        hidden
        accept="image/*"
        type="file"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onUpload(e.target.files[0])
            e.target.value = ''
          }
        }}
      />
    </Box>
  )
}
