import { NextRequest, NextResponse } from 'next/server'
import { updatePublicationSubmission, deletePublicationSubmission, createPublication, getPublicationSubmissions } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
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

  try {
    const body = await request.json()
    const { status } = body

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid status' }, { status: 400 }))
    }

    // If approving, also create a publication from the submission
    if (status === 'approved') {
      const submissions = await getPublicationSubmissions()
      const submission = submissions.find((s) => s.id === id) as PublicationSubmissionDoc | undefined
      
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

  try {
    await deletePublicationSubmission(id)
    return withSecurityHeaders(NextResponse.json({ success: true, id, message: 'Submission deleted successfully' }))
  } catch (error) {
    console.error('Error deleting publication submission:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 }))
  }
}