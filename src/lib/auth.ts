import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  Auth,
} from 'firebase/auth'
import { getApps } from 'firebase/app'
import { initializeApp } from 'firebase/app'
import { csrfHeaders } from './csrf'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Lazy initialization: defer getAuth() until first runtime use so that
// module import during build (page data collection) does not throw
// auth/invalid-api-key when env vars are not yet available.
let authInstance: Auth | null = null

function getAuthInstance(): Auth {
  if (!authInstance) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    authInstance = getAuth(app)
  }
  return authInstance
}

export { getAuthInstance as auth }

export async function loginUser(email: string, password: string) {
  const result = await signInWithEmailAndPassword(getAuthInstance(), email, password)
  const token = await result.user.getIdToken()
  return { user: result.user, token }
}

export async function registerUser(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(getAuthInstance(), email, password)
  await updateProfile(result.user, { displayName })
  const token = await result.user.getIdToken()
  return { user: result.user, token }
}

export async function logoutUser() {
  await signOut(getAuthInstance())
  // /api/auth/logout enforces CSRF double-submit — the x-csrf-token header
  // must match the csrf-token cookie, otherwise the request 403s.
  await fetch('/api/auth/logout', { method: 'POST', headers: csrfHeaders() })
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getAuthInstance(), email)
}

export async function sendVerificationEmail() {
  const user = getAuthInstance().currentUser
  if (!user) throw new Error('No authenticated user')
  await sendEmailVerification(user)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuthInstance(), callback)
}

export async function getCurrentUserToken(): Promise<string | null> {
  const user = getAuthInstance().currentUser
  if (!user) return null
  return user.getIdToken()
}

/**
 * Refresh the current user from the Firebase Auth server and mint a token
 * with the LATEST claims (email_verified, custom claims, ...).
 *
 * getIdToken() normally returns a CACHED token (~1h validity) whose claims
 * were frozen at mint time — so an email verified after login keeps
 * reporting "unverified" until the cache expires. This helper:
 *   1. reload()        — re-fetches the User record from Firebase servers
 *   2. getIdToken(true) — bypasses the token cache (force refresh)
 *
 * Returns null when no user is signed in.
 */
export async function refreshAuthToken(): Promise<string | null> {
  const user = getAuthInstance().currentUser
  if (!user) return null
  await user.reload()
  return user.getIdToken(true)
}