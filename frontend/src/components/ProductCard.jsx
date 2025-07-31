import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { motion } from 'framer-motion'

/**
 * Product card with animated entry for displaying recommended products.
 * @param {object} props - Product info fields from backend.
 */
export default function ProductCard({
  id,
  name,
  description,
  price,
  image_path,
  category,
  tags = [],
  use_cases = [],
  features = [],
}) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  // Build product image URL
  let src
  if (image_path.startsWith('http')) {
    src = image_path
  } else {
    const filename = image_path.startsWith('images/')
      ? image_path.slice('images/'.length)
      : image_path.replace(/^\/+/, '')
    src = `${backendUrl}/images/${filename}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 72, scale: 0.9, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, mass: 1, delay: 0.07 }}
      style={{ width: '100%' }}
    >
      <Card
        sx={{
          display: 'flex',
          maxWidth: 800,
          width: '100%',
          m: 2,
          boxShadow: 1,
          borderRadius: 2,
          alignItems: 'stretch',
        }}
      >
        {/* Product image (left) */}
        <Box
          sx={{
            width: 260,
            minWidth: 180,
            maxWidth: 320,
            display: 'flex',
            alignItems: 'stretch',
            backgroundColor: '#f5f5f5',
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
            overflow: 'hidden',
          }}
        >
          <img
            src={src}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 200,
              maxHeight: 320,
              objectFit: 'contain',
              borderRadius: 0,
              display: 'block',
              background: '#eee',
            }}
          />
        </Box>

        {/* Product info (right) */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 200,
          justifyContent: 'space-between',
        }}>
          <CardContent sx={{ flex: '1 1 auto' }}>
            <Typography variant="h6" gutterBottom>
              {name}
            </Typography>
            <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Category: {category}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Tags: {tags.join(', ')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Use Cases: {use_cases.join(', ')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Features: {features.join(', ')}
            </Typography>
          </CardContent>
          <Box sx={{ p: 2, pt: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Price: ${price?.toFixed(2) ?? '--'}
            </Typography>
          </Box>
        </Box>
      </Card>
    </motion.div>
  )
}
