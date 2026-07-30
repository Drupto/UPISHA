import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, Firestore, FieldValue } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

let firestoreInstance: Firestore | null = null

export function getDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app)
  }
  return firestoreInstance
}

export { FieldValue }

/**
 * Verify a Firebase ID token using the Firebase Auth REST API (admin SDK alternative).
 * Uses only NEXT_PUBLIC_* env vars — no service account needed.
 */
export async function verifyToken(token: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured')
  }
  
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    }
  )

  if (!response.ok) {
    throw new Error('Invalid token')
  }

  const data = await response.json()
  const user = data.users?.[0]

  if (!user) {
    throw new Error('User not found')
  }

  return {
    uid: user.localId,
    email: user.email || null,
    name: user.displayName || null,
  }
}