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

// NOTE: Token verification was removed from this module — it was server-side
// logic living in a client module. It now lives in the real Firebase Admin
// SDK module: src/lib/firebase-server.ts → verifyIdToken(), which uses
// admin.auth().verifyIdToken() with revocation checking and custom-claims
// support (replacing the REST identitytoolkit accounts:lookup approach).
//
// This file remains a lazy client/Web-SDK singleton (getConfig/getDb/
// getStorageInstance) for browser-side Firebase usage.
//
// HISTORICAL NOTE (for the audit trail): the previous implementation here
// verified ID tokens via the identitytoolkit REST API (accounts:lookup with
// the public web API key). That endpoint cannot check token revocation and
// does not return custom claims — which is why verification moved to the
// Admin SDK.
