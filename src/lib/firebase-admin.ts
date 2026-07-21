import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
}

let app: admin.app.App | null = null

export function getFirebaseAdmin() {
  if (!app) {
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Missing Firebase Admin environment variables')
    }
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
  }
  return app
}

export function getDb() {
  return getFirestore(getFirebaseAdmin())
}
