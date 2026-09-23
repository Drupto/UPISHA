import { NextRequest, NextResponse } from 'next/server'
import { deleteWebinarRegistration, updateWebinarRegistration } from '@/lib/firestore'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'
import { ensureWebinarReceipt } from '@/lib/webinar-receipts'

export async function PATCH(
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
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Invalid status. Must be pending, confirmed, or rejected.' },
        { status: 400 }
      ))
    }

    await updateWebinarRegistration(id, { status })

    await logAdminAction({
      action: 'webinar_registration.update',
      resourceType: 'webinarRegistration',
      resourceId: id,
      actor: admin,
      request,
      details: { status },
    })

    // Auto-generate the payment receipt when a paid webinar registration is
    // confirmed. Idempotent and non-fatal: a failure here is logged but does
    // not roll back the status update.
    if (status === 'confirmed') {
      try {
        await ensureWebinarReceipt(id)
      } catch (receiptError) {
        console.error('Error auto-generating webinar receipt:', receiptError)
      }
    }

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: `Registration marked as ${status}`,
    }))
  } catch (error) {
    console.error('Error updating webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update registration' }, { status: 500 }))
  }
}

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
    await deleteWebinarRegistration(id)

    await logAdminAction({
      action: 'webinar_registration.delete',
      resourceType: 'webinarRegistration',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 }))
  }
}