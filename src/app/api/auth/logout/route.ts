import { NextResponse } from 'next/server'
import { withSecurityHeaders } from '@/lib/security'

export async function POST() {
  const response = withSecurityHeaders(NextResponse.json({ success: true }))
  response.cookies.set('session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 0, path: '/' })
  return response
}
