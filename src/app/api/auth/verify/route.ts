import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

    const decodedToken = await getAuth().verifyIdToken(token)
    
    // Reduced session lifetime and secure cookie settings
    const response = NextResponse.json({ authenticated: true, uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name })
    response.cookies.set('session', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 60 * 60 * 2, // 2 hours instead of 7 days
      path: '/' 
    })
    return response
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
