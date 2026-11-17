import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Alert, Box, Button, Chip, Paper, Skeleton, TextField, Typography } from '@mui/material'
import { errorMessage } from '../api/client'
import { formatDate } from '../api/format'
import { askQuestion, fetchQuestions } from '../api/questions'
import type { Question } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { tokens } from '../theme/theme'

const LIMIT = 1000

function QuestionItem({ q }: { q: Question }) {
  return (
    <Box sx={{ py: 2.5, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{q.mine ? 'You' : q.authorName}</Typography>
        <Typography variant="body2" color="text.secondary">· {formatDate(q.createdAt)}</Typography>
        {!q.answer && <Chip size="small" label="Waiting for an answer" sx={{ bgcolor: tokens.sand }} />}
      </Box>
      <Typography sx={{ whiteSpace: 'pre-line' }}>{q.text}</Typography>
      {q.answer && (
        <Box sx={{ mt: 1.5, pl: 2, borderLeft: `3px solid ${tokens.amber}` }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
            Mikhail{q.answeredAt && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> · {formatDate(q.answeredAt)}</Box>}
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{q.answer}</Typography>
        </Box>
      )}
    </Box>
  )
}

/** Q&A under a package: visitors read answers, signed-in users ask. */
export function QuestionsSection({ productId }: { productId: number }) {
  const { user, loading: authLoading, openSignIn } = useAuth()
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const load = useCallback(() => {
    fetchQuestions(productId)
      .then((data) => { setQuestions(data); setLoadError(null) })
      .catch((e) => setLoadError(errorMessage(e, 'Could not load questions.')))
  }, [productId])

  // Reload when the user signs in or out: they may now see their own unanswered questions.
  useEffect(() => { if (!authLoading) load() }, [load, authLoading, user])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    setSendError(null)
    try {
      const created = await askQuestion(productId, text.trim())
      setQuestions((qs) => [created, ...(qs ?? [])])
      setText('')
      setSent(true)
    } catch (err) {
      setSendError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <Box component="section" id="questions" sx={{ scrollMarginTop: 24 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>Questions</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Not sure this package fits? Ask here — I answer within a day, and the answer helps the next person too.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: tokens.cream, mb: 2 }}>
        {user ? (
          <Box component="form" onSubmit={(e) => void submit(e)}>
            <TextField
              label="Your question" multiline minRows={3} fullWidth value={text}
              onChange={(e) => { setText(e.target.value.slice(0, LIMIT)); setSent(false) }}
              helperText={`${text.length} / ${LIMIT} · Only your first name is shown`}
              sx={{ bgcolor: 'background.paper' }}
            />
            {sendError && <Alert severity="error" sx={{ mt: 1.5 }}>{sendError}</Alert>}
            {sent && <Alert severity="success" sx={{ mt: 1.5 }}>Thanks! Your question is sent. It appears here for everyone once it is answered.</Alert>}
            <Button type="submit" variant="contained" sx={{ mt: 1.5 }} disabled={sending || !text.trim()}>
              {sending ? 'Sending…' : 'Ask a question'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography>Sign in to ask a question about this package.</Typography>
            <Button variant="contained" color="secondary" onClick={openSignIn}>Sign in to ask</Button>
          </Box>
        )}
      </Paper>

      {loadError && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{loadError}</Alert>
      )}
      {questions === null && !loadError && [0, 1].map((i) => <Skeleton key={i} height={72} />)}
      {questions?.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2 }}>No questions yet. Be the first to ask.</Typography>
      )}
      {questions?.map((q) => <QuestionItem key={q.id} q={q} />)}
    </Box>
  )
}
