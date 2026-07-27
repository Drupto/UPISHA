import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) })
    }

    const decodedToken = await admin.auth().verifyIdToken(token)
    const response = NextResponse.json({ authenticated: true, uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name })
    response.cookies.set('session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60*60*24*7, path: '/' })
    return response
  } catch {
    return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 })
  }
}