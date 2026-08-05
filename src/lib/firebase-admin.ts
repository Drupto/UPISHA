import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore, FieldValue } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Lazy initialization: defer initializeApp() until first runtime use so
// that module import during build (page data collection) does not run
// when env vars are not yet available.
let appInstance: FirebaseApp | null = null

function getAppInstance(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  }
  return appInstance
}

let firestoreInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

export function getDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getAppInstance())
  }
  return firestoreInstance
}

export function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(getAppInstance())
  }
  return storageInstance
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
    emailVerified: user.emailVerified === true,
  }
}