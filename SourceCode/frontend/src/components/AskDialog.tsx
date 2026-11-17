import { useNavigate } from 'react-router'
import { Dialog, DialogContent, DialogTitle, List, ListItemButton, ListItemText, Typography } from '@mui/material'
import type { Product } from '../api/types'

/** "Ask me something first": pick the package the question is about, then go to its Q&A. */
export function AskDialog({ open, onClose, packages }: { open: boolean; onClose: () => void; packages: Product[] }) {
  const navigate = useNavigate()
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Typography variant="h3" component="span">What is your question about?</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 1.5 }}>
        <Typography color="text.secondary" sx={{ px: 1.5, mb: 1 }}>
          Pick the closest package. Questions and answers are public, so they help other clients too.
        </Typography>
        <List>
          {packages.map((p) => (
            <ListItemButton key={p.id} sx={{ borderRadius: 2 }}
                            onClick={() => { onClose(); void navigate(`/packages/${p.slug}#questions`) }}>
              <ListItemText primary={p.name} secondary={p.shortDescription} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  )
}
