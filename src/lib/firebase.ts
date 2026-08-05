import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Lazy initialization: defer initializeApp()/getFirestore() until first
// runtime use so that module import during build (page data collection)
// does not throw when env vars are not yet available.
let appInstance: FirebaseApp | null = null
let dbInstance: Firestore | null = null

function getAppInstance(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return appInstance
}

export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getAppInstance())
  }
  return dbInstance
}

// Backwards-compatible `db` export as a getter-based proxy so existing
// `import { db } from '@/lib/firebase'` usage keeps working while still
// deferring initialization until first property access.
export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getDb()
    const value = Reflect.get(instance, prop)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

// Lazy default export: callers must invoke to get the app instance,
// ensuring initializeApp() is deferred until first runtime use.
export default getAppInstance
