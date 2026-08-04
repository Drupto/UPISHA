import { NextRequest, NextResponse } from 'next/server'
import { getMemberByUid } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
import { requireVerifiedMember } from '@/lib/auth-helpers'

/**
 * GET /api/members/me
 * Returns the authenticated member's own profile (read-only).
 * Members cannot edit their own profile; only admins can via /api/members/[id].
 */
export async function GET(request: NextRequest) {
  const auth = await requireVerifiedMember(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const decoded = auth as { uid: string }
    const member = await getMemberByUid(decoded.uid)

    if (!member) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member profile not found' }, { status: 404 }))
    }

    return withSecurityHeaders(NextResponse.json({ member }))
  } catch (error) {
    console.error('Error fetching member profile:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 }))
  }
}