import { NextRequest, NextResponse } from 'next/server'
import { updateWebinar, deleteWebinar } from '@/lib/firestore'
import { webinarSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'

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

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  try {
    const body = await request.json()
    const validated = webinarSchema.partial().parse(body)

    await updateWebinar(id, {
      ...validated,
      title: validated.title ? sanitizeHtml(validated.title) : undefined,
      speaker: validated.speaker ? sanitizeHtml(validated.speaker) : undefined,
      description: validated.description ? sanitizeHtml(validated.description) : undefined,
      registrationLink: validated.registrationLink ? sanitizeHtml(validated.registrationLink) : undefined,
      meetingLink: validated.meetingLink ? sanitizeHtml(validated.meetingLink) : undefined,
    })

    await logAdminAction({
      action: 'webinar.update',
      resourceType: 'webinar',
      resourceId: id,
      actor: admin,
      request,
      details: { fields: Object.keys(validated) },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Webinar updated successfully',
    }))
  } catch (err: unknown) {
    console.error('Error updating webinar:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update webinar' }, { status: 500 }))
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
    await deleteWebinar(id)

    await logAdminAction({
      action: 'webinar.delete',
      resourceType: 'webinar',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Webinar deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting webinar:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete webinar' }, { status: 500 }))
  }
}