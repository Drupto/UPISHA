import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    if (!sessionToken) return NextResponse.json({ authenticated: false }, { status: 401 })

    const decodedToken = await verifyToken(sessionToken)
    return NextResponse.json({ authenticated: true, uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
