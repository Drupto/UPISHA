import { NextRequest, NextResponse } from 'next/server'
import { getPublicationSubmissionsByEmail } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  const decoded = auth as { uid: string; email: string | null }
  if (!decoded.email) {
    return withSecurityHeaders(NextResponse.json({ error: 'No email associated with account' }, { status: 400 }))
  }

  try {
    const submissions = await getPublicationSubmissionsByEmail(decoded.email)
    return withSecurityHeaders(NextResponse.json({ submissions }))
  } catch (error) {
    console.error('Error fetching my publication submissions:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 }))
  }
}