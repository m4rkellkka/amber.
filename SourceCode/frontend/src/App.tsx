import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/Layout'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrdersPage } from './pages/OrdersPage'
import { CartPage } from './pages/CartPage'
import { PackagePage } from './pages/PackagePage'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/packages/:slug', element: <PackagePage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/admin', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
