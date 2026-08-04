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
} from 'firebase/auth'
import { getApps } from 'firebase/app'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)

export { auth }

export async function loginUser(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  const token = await result.user.getIdToken()
  return { user: result.user, token }
}

export async function registerUser(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  const token = await result.user.getIdToken()
  return { user: result.user, token }
}

export async function logoutUser() {
  await signOut(auth)
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function sendVerificationEmail() {
  const user = auth.currentUser
  if (!user) throw new Error('No authenticated user')
  await sendEmailVerification(user)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getCurrentUserToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}