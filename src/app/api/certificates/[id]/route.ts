import { NextRequest, NextResponse } from 'next/server'
import { updateCertificate, deleteCertificate } from '@/lib/firestore'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { getClientIp } from '@/lib/firestore-rate-limit'
import { logAdminAction } from '@/lib/audit-log'
import { enforceBodySizeLimit } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-helpers'

const ALLOWED_STATUSES = ['issued', 'revoked'] as const

/** Firestore updateDoc/deleteDoc reject missing docs — surface it as a clean 404. */
function isNotFound(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === 'not-found'
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with POST /api/certificates
  // and the templates endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  // Reject oversized request bodies (parity with POST /api/certificates).
  if (!enforceBodySizeLimit(request.headers)) {
    return withSecurityHeaders(NextResponse.json({ error: 'Request body too large' }, { status: 413 }))
  }

  const ip = getClientIp(request.headers)

  try {
    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    // Whitelist: only 'issued' | 'revoked' may be written — an arbitrary status
    // string would corrupt the record (and later render as "Active" in the
    // admin table).
    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return withSecurityHeaders(NextResponse.json(
          { error: `Invalid status "${String(body.status)}". Allowed values: issued, revoked.` },
          { status: 400 }
        ))
      }
      updateData.status = body.status
    }

    // Nothing recognisable to change — fail loudly instead of answering
    // "updated successfully" for a silent no-op.
    if (Object.keys(updateData).length === 0) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'No supported fields to update. Send { "status": "issued" | "revoked" }.' },
        { status: 400 }
      ))
    }

    await updateCertificate(id, updateData)

    // Audit log the status change
    await logAdminAction({
      action: 'certificate.update',
      resourceType: 'certificate',
      resourceId: id,
      actor: admin,
      ip,
      userAgent: request.headers.get('user-agent'),
      details: { status: updateData.status },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Certificate updated successfully',
    }))
  } catch (error) {
    if (isNotFound(error)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Certificate not found' }, { status: 404 }))
    }
    console.error('Error updating certificate:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 }))
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

  // CSRF protection for mutating requests (parity with POST /api/certificates
  // and the templates endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  const ip = getClientIp(request.headers)

  try {
    await deleteCertificate(id)

    // Audit log the deletion
    await logAdminAction({
      action: 'certificate.delete',
      resourceType: 'certificate',
      resourceId: id,
      actor: admin,
      ip,
      userAgent: request.headers.get('user-agent'),
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully',
    }))
  } catch (error) {
    if (isNotFound(error)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Certificate not found' }, { status: 404 }))
    }
    console.error('Error deleting certificate:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 }))
  }
}