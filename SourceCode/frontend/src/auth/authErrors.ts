import { FirebaseError } from 'firebase/app'

/** Turns Firebase error codes into short, friendly messages. null = user closed the popup, show nothing. */
export function authErrorMessage(error: unknown): string | null {
  const code = error instanceof FirebaseError ? error.code : ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute and try again.'
    case 'auth/network-request-failed':
      return 'No internet connection. Please try again.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google window. Allow pop-ups and try again.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is already used with another sign-in method.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null
    default:
      return 'Something went wrong. Please try again.'
  }
}
