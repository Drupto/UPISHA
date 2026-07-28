import { NextRequest, NextResponse } from 'next/server'
import { getProfessionals } from '@/lib/data'
import { withSecurityHeaders } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const professionals = await getProfessionals()
    return withSecurityHeaders(NextResponse.json({ professionals }))
  } catch (error) {
    console.error('Error fetching professionals:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 }))
  }
}