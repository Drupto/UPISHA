import { NextRequest, NextResponse } from 'next/server'
import { updateTeachRequest, deleteTeachRequest, getTeachRequests } from '@/lib/firestore'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { enqueueEmail } from '@/lib/email-outbox'

const ALLOWED_STATUSES = ['new', 'contacted', 'accepted', 'rejected'] as const
type TeachRequestStatus = (typeof ALLOWED_STATUSES)[number]

function isTeachRequestStatus(value: unknown): value is TeachRequestStatus {
  return typeof value === 'string' && (ALLOWED_STATUSES as readonly string[]).includes(value)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const { id } = await params
    const body = await request.json()

    // Only review-workflow fields may change — the applicant's submitted
    // data is immutable once created (mass-assignment guard).
    const update: { status?: TeachRequestStatus; isRead?: boolean; adminNotes?: string } = {}
    if ('status' in body) {
      if (!isTeachRequestStatus(body.status)) {
        return withSecurityHeaders(NextResponse.json({ error: 'Invalid status value' }, { status: 400 }))
      }
      update.status = body.status
    }
    if ('isRead' in body) update.isRead = Boolean(body.isRead)
    if ('adminNotes' in body) {
      if (body.adminNotes !== null && typeof body.adminNotes !== 'string') {
        return withSecurityHeaders(NextResponse.json({ error: 'Invalid admin notes' }, { status: 400 }))
      }
      update.adminNotes = body.adminNotes?.slice(0, 2000) ?? null
    }

    if (Object.keys(update).length === 0) {
      return withSecurityHeaders(NextResponse.json({ error: 'No valid fields to update' }, { status: 400 }))
    }

    const teachRequest = (await getTeachRequests()).find((r) => r.id === id)
    await updateTeachRequest(id, update)

    const notify = body?.notify !== false
    if (
      notify &&
      teachRequest &&
      (update.status === 'accepted' || update.status === 'rejected')
    ) {
      try {
        await enqueueEmail({
          dedupeKey: `teach-decision:${id}:${update.status}`,
          template: 'teach-decision',
          to: { email: teachRequest.email, name: teachRequest.name },
          templateData: {
            fullName: teachRequest.name,
            topic: teachRequest.topic,
            status: update.status,
            note: update.adminNotes ?? undefined,
          },
          source: { collection: 'teachRequests', id },
          requestedBy: { type: 'admin', uid: admin.uid, email: admin.email },
          approvedBy: { uid: admin.uid, email: admin.email },
        })
      } catch (queueError) {
        console.error('Failed to queue teach decision email:', queueError)
      }
    }

    return withSecurityHeaders(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Error updating teach request:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update teach request' }, { status: 500 }))
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  // CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const { id } = await params
    await deleteTeachRequest(id)
    return withSecurityHeaders(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Error deleting teach request:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete teach request' }, { status: 500 }))
  }
}