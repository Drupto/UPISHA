import admin from 'firebase-admin'

let isInitialized = false

export function getDb() {
  if (!isInitialized) {
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) })
    }
    isInitialized = true
  }
  return admin.firestore()
}

export function getAuth() {
  if (!isInitialized) {
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) })
    }
    isInitialized = true
  }
  return admin.auth()
}
