import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    if (!sessionToken) return NextResponse.json({ authenticated: false }, { status: 401 })

    const decodedToken = await getAuth().verifyIdToken(sessionToken)
    return NextResponse.json({ authenticated: true, uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
