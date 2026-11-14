import { NextRequest, NextResponse } from 'next/server'
import { updatePublicationSubmission, deletePublicationSubmission, createPublication, getPublicationSubmissions } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'
import { enqueueEmail } from '@/lib/email-outbox'
import type { PublicationSubmissionDoc } from '@/lib/types'

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
    const notify = body?.notify !== false

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid status' }, { status: 400 }))
    }

    // If approving, also create a publication from the submission
    let submission = (await getPublicationSubmissions()).find((s) => s.id === id) as
      | PublicationSubmissionDoc
      | undefined

    if (status === 'approved') {
      if (submission) {
        await createPublication({
          title: sanitizeHtml(submission.title),
          description: sanitizeHtml(submission.description),
          type: submission.type,
          author: sanitizeHtml(submission.authorName),
          fileUrl: submission.fileUrl ? sanitizeHtml(submission.fileUrl) : null,
          isActive: true,
        })
      }
    }

    await updatePublicationSubmission(id, { status })

    if (notify && (status === 'approved' || status === 'rejected') && submission) {
      try {
        await enqueueEmail({
          dedupeKey: `publication-decision:${id}:${status}`,
          template: 'publication-decision',
          to: { email: submission.authorEmail, name: submission.authorName },
          templateData: {
            authorName: submission.authorName,
            title: submission.title,
            status,
          },
          source: { collection: 'publicationSubmissions', id },
          requestedBy: { type: 'admin', uid: admin.uid, email: admin.email },
          approvedBy: { uid: admin.uid, email: admin.email },
        })
      } catch (queueError) {
        console.error('Failed to queue publication decision email:', queueError)
      }
    }

    await logAdminAction({
      action: 'submission.review',
      resourceType: 'publicationSubmission',
      resourceId: id,
      actor: admin,
      request,
      details: { status, publicationCreated: status === 'approved' },
    })

    return withSecurityHeaders(NextResponse.json({ success: true, id, message: `Submission ${status}` }))
  } catch (error) {
    console.error('Error updating publication submission:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update submission' }, { status: 500 }))
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
    await deletePublicationSubmission(id)

    await logAdminAction({
      action: 'submission.delete',
      resourceType: 'publicationSubmission',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({ success: true, id, message: 'Submission deleted successfully' }))
  } catch (error) {
    console.error('Error deleting publication submission:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 }))
  }
}