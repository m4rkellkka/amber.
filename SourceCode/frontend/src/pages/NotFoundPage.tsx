import { Link as RouterLink } from 'react-router'
import { Box, Button, Typography } from '@mui/material'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <Box sx={{ py: 14, textAlign: 'center', px: 2 }}>
      <Typography variant="h1" gutterBottom>Page not found</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>This page does not exist or was moved.</Typography>
      <Button component={RouterLink} to="/" variant="contained" size="large">Back to home</Button>
    </Box>
  )
}
