import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router'
import { SignInDialog } from '../auth/SignInDialog'
import { Footer } from './Footer'
import { Header } from './Header'
import { EdgeLianas } from './nature/decorations'
import { ScrollToHash } from './ScrollToHash'

/** Frame for every page: header, page content, footer, and the sign-in dialog. */
export function Layout() {
  // The admin panel is a work tool: no plants there.
  const plants = !useLocation().pathname.startsWith('/admin')
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'clip' }}>
      {plants && <EdgeLianas />}
      <ScrollToHash />
      <Box component="a" href="#main"
           sx={{
             position: 'absolute', left: 16, top: -48, zIndex: 2000, px: 2, py: 1, borderRadius: 2,
             bgcolor: 'secondary.main', color: 'secondary.contrastText', textDecoration: 'none',
             '&:focus': { top: 12 },
           }}>
        Skip to content
      </Box>
      <Header />
      <Box component="main" id="main" tabIndex={-1} sx={{ flex: 1, outline: 'none' }}>
        <Outlet />
      </Box>
      <Footer />
      <SignInDialog />
    </Box>
  )
}
