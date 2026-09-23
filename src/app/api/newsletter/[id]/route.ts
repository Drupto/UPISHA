import { NextRequest, NextResponse } from 'next/server'
import { deleteNewsletterSubscriber } from '@/lib/firestore'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  try {
    await deleteNewsletterSubscriber(id)

    await logAdminAction({
      action: 'subscriber.delete',
      resourceType: 'newsletterSubscriber',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 }))
  }
}