import { Box } from '@mui/material'
import { Outlet } from 'react-router'
import { SignInDialog } from '../auth/SignInDialog'
import { Footer } from './Footer'
import { Header } from './Header'
import { ScrollToHash } from './ScrollToHash'

/** Frame for every page: header, page content, footer, and the sign-in dialog. */
export function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToHash />
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <SignInDialog />
    </Box>
  )
}
