import axios, { isAxiosError } from 'axios'
import { auth } from '../auth/firebase'
import type { Problem } from './types'

/**
 * One HTTP client for the whole app. Every request gets the current Firebase ID token,
 * so the back-end knows who is calling. getIdToken() refreshes the token when it expires.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
})

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`
  }
  return config
})

/** A human-readable message for any failed request. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError<Problem>(error)) {
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
    return error.response.data?.detail ?? fallback
  }
  return fallback
}

/** Per-field messages from a 400 validation error, e.g. { name: 'Name is required' }. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError<Problem>(error)) return error.response?.data?.fieldErrors ?? {}
  return {}
}
