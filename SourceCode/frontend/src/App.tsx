import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Box, CircularProgress } from '@mui/material'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

// Loaded on demand: the home page does not download admin or checkout code.
const PackagePage = lazy(() => import('./pages/PackagePage').then((m) => ({ default: m.PackagePage })))
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })))
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })))

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Box sx={{ py: 12, textAlign: 'center' }}><CircularProgress /></Box>}>
      {children}
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/packages/:slug', element: <Page><PackagePage /></Page> },
      { path: '/cart', element: <Page><CartPage /></Page> },
      { path: '/orders', element: <Page><OrdersPage /></Page> },
      { path: '/admin', element: <Page><AdminPage /></Page> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
