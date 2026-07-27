import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    if (!sessionToken) return NextResponse.json({ authenticated: false }, { status: 401 })

    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) })
    }

    const decodedToken = await admin.auth().verifyIdToken(sessionToken)
    return NextResponse.json({ authenticated: true, uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}