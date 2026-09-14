import { NextRequest, NextResponse } from 'next/server'
import { getEmailQuotaToday } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

/**
 * Admin-only: today's transactional email quota (Brevo daily limit), as
 * tracked by the Cloud Functions in `emailQuota/{YYYY-MM-DD}`. The admin
 * dashboard renders an alert when the daily limit is exhausted.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const quota = await getEmailQuotaToday()
    return withSecurityHeaders(NextResponse.json({ quota }))
  } catch (error) {
    console.error('Error fetching email quota:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch email quota' }, { status: 500 }))
  }
}
