// App.jsx
import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Snackbar,
} from '@mui/material'
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material'

import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'

/**
 * Root component for the AI Commerce Assistant frontend.
 * Handles chat state, backend requests, and streaming (typewriter) assistant replies.
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App({ mode, toggleMode }) {
  // Main chat state and UI control
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [streamingMessage, setStreamingMessage] = useState(null)
  const bottomRef = useRef()
  const abortCtrlRef = useRef(null)

  // Scroll to latest message whenever messages/streaming/animation changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, streamingMessage])

  // Show error in Snackbar
  const showError = (msg) => setErrorMsg(msg)

  // Interrupt ongoing backend or streaming response
  const handleStop = () => {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort()
      setLoading(false)
      abortCtrlRef.current = null
    }
    setStreamingMessage(null)
  }

  /**
   * Streams assistant response to UI as a typewriter animation.
   * @param {string} fullText - Full response to stream out.
   * @param {function=} onDone - Optional callback after streaming ends.
   */
  const streamAssistantReply = (fullText, onDone) => {
    let i = 0
    setStreamingMessage('')
    function nextChar() {
      setStreamingMessage(fullText.slice(0, i + 1))
      i++
      if (i < fullText.length) {
        setTimeout(nextChar, 18)
      } else {
        setMessages((m) => [
          ...m.slice(0, m.length - 1), // Replace streaming with final
          { role: 'assistant', content: fullText }
        ])
        setStreamingMessage(null)
        if (typeof onDone === 'function') onDone()
      }
    }
    nextChar()
  }

  // Sends a text message, triggers assistant response with optional product cards
  const sendText = async (text) => {
    if (!text) return
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    const ctrl = new AbortController()
    abortCtrlRef.current = ctrl

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: ctrl.signal,
      })
      const data = await res.json()

      if (data.type === 'chat' || data.type === 'recommendation') {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: '', isStreaming: true }
        ])
        streamAssistantReply(data.response, () => {
          if (data.products && data.products.length > 0) {
            setMessages((m) => [
              ...m,
              ...data.products.map((p) => ({ product: p }))
            ])
          }
        })
        return
      }
    } catch (e) {
      if (e.name !== 'AbortError') showError('Failed to contact backend.')
    } finally {
      setLoading(false)
      abortCtrlRef.current = null
    }
  }

  // Sends an image, previews locally, uploads to backend, streams assistant reply if found
  const sendImage = async (file) => {
    if (!file) return

    // Local preview in chat
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    setMessages((m) => [...m, { role: 'user', content: { image: dataUrl } }])
    setLoading(true)

    // Upload image to backend
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`${BACKEND_URL}/search-image`, {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (data.type === 'image-search') {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: '', isStreaming: true }
        ])
        streamAssistantReply(data.response, () => {
          if (data.products && data.products.length > 0) {
            setMessages((m) => [
              ...m,
              ...data.products.map((p) => ({ product: p }))
            ])
          }
        })
        return
      } else {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: 'Unexpected image search response.' }
        ])
      }
    } catch (e) {
      if (e.name !== 'AbortError') showError('Image search failed.')
    } finally {
      setLoading(false)
      abortCtrlRef.current = null
    }
  }

  // Show streaming message if in progress
  const displayMessages =
    streamingMessage !== null
      ? [
          ...messages.slice(0, messages.length - 1),
          { role: 'assistant', content: streamingMessage }
        ]
      : messages

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Commerce Assistant
          </Typography>
          <IconButton onClick={toggleMode} color="inherit">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box flex={1} overflow="auto" p={2} bgcolor="background.default">
        <ChatWindow messages={displayMessages} loading={loading} />
        <div ref={bottomRef} />
      </Box>

      <Box
        borderTop="1px solid"
        borderColor="divider"
        p={2}
        display="flex"
        justifyContent="center"
      >
        <Box width="100%" maxWidth="800px">
          <ChatInput
            onSend={sendText}
            onUpload={sendImage}
            disabled={loading || streamingMessage !== null}
            isGenerating={loading || streamingMessage !== null}
            onStop={handleStop}
          />
        </Box>
      </Box>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={3000}
        message={errorMsg}
        onClose={() => setErrorMsg('')}
      />
    </Box>
  )
}
