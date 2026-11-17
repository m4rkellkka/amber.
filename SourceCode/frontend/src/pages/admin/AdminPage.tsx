import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Box, Container, Tab, Tabs, Typography } from '@mui/material'
import { useAuth } from '../../auth/AuthContext'
import { RequireAdmin } from '../../auth/RequireAuth'
import { AddProductTab } from './AddProductTab'
import { OrdersTab } from './OrdersTab'
import { OverviewTab } from './OverviewTab'
import { QuestionsTab } from './QuestionsTab'
import { StockTab } from './StockTab'
import { usePageTitle } from '../../hooks/usePageTitle'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'add', label: 'Add product' },
  { id: 'stock', label: 'Stock' },
  { id: 'questions', label: 'Questions' },
  { id: 'orders', label: 'Orders' },
] as const

type TabId = (typeof tabs)[number]['id']

function AdminPanel() {
  const { me } = useAuth()
  const [params, setParams] = useSearchParams()
  const current = (tabs.find((t) => t.id === params.get('tab'))?.id ?? 'overview') as TabId
  // Bumped after changes in one tab so other tabs show fresh numbers.
  const [version, setVersion] = useState(0)
  const changed = () => setVersion((v) => v + 1)
  const open = (tab: string) => setParams({ tab }, { replace: true })

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 0.5 }}>Admin panel</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Signed in as {me?.email}</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={current} onChange={(_, v: string) => open(v)} variant="scrollable" allowScrollButtonsMobile>
          {tabs.map((t) => <Tab key={t.id} value={t.id} label={t.label} />)}
        </Tabs>
      </Box>

      {current === 'overview' && <OverviewTab key={version} onOpenTab={open} />}
      {current === 'add' && <AddProductTab onCreated={changed} />}
      {current === 'stock' && <StockTab refreshKey={version} />}
      {current === 'questions' && <QuestionsTab onChanged={changed} />}
      {current === 'orders' && <OrdersTab onChanged={changed} />}
    </Container>
  )
}

/** /admin — only for ADMIN; every request is checked again on the server. */
export function AdminPage() {
  usePageTitle('Admin')
  return <RequireAdmin><AdminPanel /></RequireAdmin>
}
