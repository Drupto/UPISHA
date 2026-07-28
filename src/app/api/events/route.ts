import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data'
import { withSecurityHeaders } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const events = await getEvents()
    return withSecurityHeaders(NextResponse.json({ events }))
  } catch (error) {
    console.error('Error fetching events:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 }))
  }
}
