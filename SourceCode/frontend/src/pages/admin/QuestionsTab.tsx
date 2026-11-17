import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { Alert, Box, Button, Link, Paper, Skeleton, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { adminApi, type AdminQuestion } from '../../api/admin'
import { errorMessage } from '../../api/client'
import { formatDate } from '../../api/format'
import { useNotify } from '../../components/Notifier'
import { tokens } from '../../theme/theme'

function QuestionCard({ q, onAnswered }: { q: AdminQuestion; onAnswered: (q: AdminQuestion) => void }) {
  const notify = useNotify()
  const [answer, setAnswer] = useState(q.answer ?? '')
  const [editing, setEditing] = useState(q.answer === null)
  const [busy, setBusy] = useState(false)

  const send = async () => {
    setBusy(true)
    try {
      const updated = await adminApi.answer(q.id, answer.trim())
      onAnswered(updated)
      setEditing(false)
      notify('Answer published')
    } catch (e) {
      notify(errorMessage(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="body2" color="text.secondary">
        <Link component={RouterLink} to={`/packages/${q.productSlug}#questions`} sx={{ color: tokens.link, fontWeight: 600 }}>
          {q.productName}
        </Link>
        {' · '}{q.authorName ?? 'No name'} ({q.authorEmail}) · {formatDate(q.createdAt)}
      </Typography>
      <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{q.text}</Typography>

      {editing ? (
        <Box sx={{ mt: 2 }}>
          <TextField label="Your answer" multiline minRows={2} fullWidth value={answer}
                     onChange={(e) => setAnswer(e.target.value.slice(0, 2000))}
                     helperText="Everyone will see this answer under the package" />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="contained" disabled={busy || !answer.trim()} onClick={() => void send()}>
              {busy ? 'Publishing…' : q.answer ? 'Save answer' : 'Publish answer'}
            </Button>
            {q.answer && <Button color="secondary" onClick={() => { setAnswer(q.answer ?? ''); setEditing(false) }}>Cancel</Button>}
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 1.5, pl: 2, borderLeft: `3px solid ${tokens.amber}` }}>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{q.answer}</Typography>
          <Button size="small" sx={{ mt: 0.5, ml: -1 }} onClick={() => setEditing(true)}>Edit answer</Button>
        </Box>
      )}
    </Paper>
  )
}

/** Inbox of client questions; oldest unanswered first. */
export function QuestionsTab({ onChanged }: { onChanged: () => void }) {
  const [unanswered, setUnanswered] = useState(true)
  const [questions, setQuestions] = useState<AdminQuestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((onlyUnanswered: boolean) => {
    adminApi.questions(onlyUnanswered)
      .then((q) => { setQuestions(q); setError(null) })
      .catch((e) => setError(errorMessage(e)))
  }, [])
  useEffect(() => { load(unanswered) }, [load, unanswered])

  const onAnswered = (q: AdminQuestion) => {
    setQuestions((list) => (unanswered ? list?.filter((x) => x.id !== q.id) : list?.map((x) => (x.id === q.id ? q : x))) ?? null)
    onChanged()
  }

  return (
    <Box>
      <ToggleButtonGroup exclusive size="small" value={unanswered ? 'open' : 'all'} sx={{ mb: 2 }}
                         onChange={(_, v: string | null) => { if (v) { setQuestions(null); setUnanswered(v === 'open') } }}>
        <ToggleButton value="open" sx={{ px: 2 }}>Waiting for answer</ToggleButton>
        <ToggleButton value="all" sx={{ px: 2 }}>All questions</ToggleButton>
      </ToggleButtonGroup>
      {error && <Alert severity="error">{error}</Alert>}
      {!questions && !error && Array.from({ length: 2 }, (_, i) => <Skeleton key={i} variant="rounded" height={140} sx={{ mb: 2 }} />)}
      {questions?.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center', bgcolor: tokens.cream }}>
          <Typography variant="h4" component="p">{unanswered ? 'Inbox zero' : 'No questions yet'}</Typography>
          <Typography color="text.secondary">
            {unanswered ? 'Every question has an answer.' : 'Questions from package pages will appear here.'}
          </Typography>
        </Paper>
      )}
      <Box sx={{ display: 'grid', gap: 2 }}>
        {questions?.map((q) => <QuestionCard key={q.id} q={q} onAnswered={onAnswered} />)}
      </Box>
    </Box>
  )
}
