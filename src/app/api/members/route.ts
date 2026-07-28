import { NextRequest, NextResponse } from 'next/server'
import { getMembers } from '@/lib/data'
import { withSecurityHeaders } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const members = await getMembers()
    return withSecurityHeaders(NextResponse.json({ members }))
  } catch (error) {
    console.error('Error fetching members:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 }))
  }
}
