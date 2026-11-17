import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase web config. These values are public by design: they only identify the project.
// Access is protected by Firebase Auth rules and by the back-end verifying every token.
const firebaseConfig = {
  apiKey: 'AIzaSyCz03nQXD7sYfIaDqH6-8ogvUhJkRJJPh0',
  authDomain: 'amber-58d76.firebaseapp.com',
  projectId: 'amber-58d76',
  storageBucket: 'amber-58d76.firebasestorage.app',
  messagingSenderId: '392649737801',
  appId: '1:392649737801:web:68eea5bc1ed54bc12c2198',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
