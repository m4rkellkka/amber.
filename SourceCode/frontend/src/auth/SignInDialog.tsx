import { useState, type FormEvent } from 'react'
import {
  Alert, Box, Button, Dialog, DialogContent, DialogTitle, Divider, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material'
import {
  GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification,
  signInWithEmailAndPassword, signInWithPopup, updateProfile,
} from 'firebase/auth'
import { auth } from './firebase'
import { authErrorMessage } from './authErrors'
import { useAuth } from './AuthContext'

type Mode = 'signin' | 'signup'

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  )
}

/** Sign in / create account with email + password, or with Google. */
export function SignInDialog() {
  const { signInOpen, closeSignIn, refreshMe } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const finish = () => {
    setPassword('')
    setError(null)
    closeSignIn()
  }

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      finish()
    } catch (e) {
      setError(authErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void run(async () => {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
        return
      }
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() })
        await user.getIdToken(true) // new token carries the name to the back-end
        await refreshMe()
      }
      void sendEmailVerification(user).catch(() => undefined)
    })
  }

  const onGoogle = () => void run(async () => {
    await signInWithPopup(auth, new GoogleAuthProvider())
  })

  return (
    <Dialog open={signInOpen} onClose={busy ? undefined : closeSignIn} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h3" component="span">
          {mode === 'signin' ? 'Welcome back' : 'Create an account'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Tabs value={mode} onChange={(_, v: Mode) => { setMode(v); setError(null) }} sx={{ mb: 2 }}>
          <Tab value="signin" label="Sign in" />
          <Tab value="signup" label="Create account" />
        </Tabs>

        <Box component="form" onSubmit={onSubmit} noValidate={false}>
          <Stack spacing={2}>
            {mode === 'signup' && (
              <TextField label="Your name" value={name} onChange={(e) => setName(e.target.value)}
                         autoComplete="name" fullWidth />
            )}
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       autoComplete="email" required fullWidth />
            <TextField label="Password" type="password" value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                       helperText={mode === 'signup' ? 'At least 6 characters' : undefined}
                       required fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={busy} fullWidth>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2.5, color: 'text.secondary', fontSize: 14 }}>or</Divider>

        <Button variant="outlined" color="secondary" size="large" fullWidth disabled={busy}
                startIcon={<GoogleMark />} onClick={onGoogle}>
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  )
}
