import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { verifyToken } from './firebase-admin'

export async function requireAuth(request: NextRequest) {
  const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '') || 
                       request.cookies.get('session')?.value

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decodedToken = await verifyToken(sessionToken)
    return decodedToken
  } catch {
    return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 })
  }
}

export function createErrorResponse(error: unknown, defaultMessage: string, status: number = 500) {
  console.error(defaultMessage, error)
  return NextResponse.json({ error: defaultMessage }, { status })
}