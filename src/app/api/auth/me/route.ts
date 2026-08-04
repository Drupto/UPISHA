import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import { getUserByUid, getMemberByUid } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    if (!sessionToken) return NextResponse.json({ authenticated: false }, { status: 401 })

    const decodedToken = await verifyToken(sessionToken)
    const userRecord = await getUserByUid(decodedToken.uid)

    // Fetch member approval status (only for member role)
    let memberStatus: string | null = null
    if (userRecord?.role === 'member') {
      const member = await getMemberByUid(decodedToken.uid)
      memberStatus = member?.status ?? null
    }

    return NextResponse.json({
      authenticated: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: userRecord?.role ?? 'user',
      emailVerified: decodedToken.emailVerified,
      memberStatus,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}