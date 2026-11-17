import { Box, Container, Typography } from '@mui/material'

export function Footer() {
  return (
    <Box component="footer" sx={{ mt: 10 }}>
      <Container maxWidth="lg">
        <Box sx={{
          borderTop: 1, borderColor: 'divider', py: 3,
          display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between',
        }}>
          <Typography variant="body2" color="text.secondary">amber — Mikhail, Istanbul</Typography>
          <Typography variant="body2" color="text.secondary">Built with React, Spring Boot and PostgreSQL</Typography>
        </Box>
      </Container>
    </Box>
  )
}
