import { Link as RouterLink } from 'react-router'
import { Box, Button, Typography } from '@mui/material'
import { DroopingVine } from '../components/nature/decorations'
import { usePageTitle } from '../hooks/usePageTitle'
import { fonts, tokens } from '../theme/theme'

export function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <Box sx={{ pb: 10, textAlign: 'center', px: 2 }}>
      <DroopingVine sx={{ mx: 'auto', mb: 2 }} />
      <Typography variant="h1" gutterBottom>Page not found</Typography>
      <Typography sx={{ fontFamily: fonts.hand, fontSize: 26, color: tokens.moss, transform: 'rotate(-2deg)', mb: 1.5 }}>
        this page didn't grow
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>This page does not exist or was moved.</Typography>
      <Button component={RouterLink} to="/" variant="contained" size="large">Back to home</Button>
    </Box>
  )
}
