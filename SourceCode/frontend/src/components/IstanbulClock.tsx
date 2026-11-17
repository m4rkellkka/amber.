import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'

const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Istanbul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** "Istanbul, 16:10": local time in Istanbul, so clients abroad know when to expect a reply. */
export function IstanbulClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <Typography component="span" variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
      Istanbul, {format.format(now)}
    </Typography>
  )
}
