import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import { createUserRecord, getUserByUid } from '@/lib/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

    const decodedToken = await verifyToken(token)

    // Ensure a user record exists in Firestore (role-based access control).
    // Default role is 'user'; existing records are preserved (merge).
    let userRecord = await getUserByUid(decodedToken.uid)
    if (!userRecord) {
      await createUserRecord({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
        role: 'user',
      })
      userRecord = await getUserByUid(decodedToken.uid)
    }

    // Reduced session lifetime and secure cookie settings
    const response = NextResponse.json({
      authenticated: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: userRecord?.role ?? 'user',
    })
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
