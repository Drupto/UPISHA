import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements } from '@/lib/data'
import { withSecurityHeaders } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const announcements = await getAnnouncements()
    return withSecurityHeaders(NextResponse.json({ announcements }))
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 }))
  }
}
