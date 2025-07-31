// main.jsx
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'
import './index.css'

function Root() {
  const [mode, setMode] = useState('dark')
  const theme = createTheme({ palette: { mode } })

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Pass both mode and toggler into App */}
      <App mode={mode} toggleMode={toggleMode} />
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
