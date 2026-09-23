import { NextRequest, NextResponse } from 'next/server'
import { updateEvent, deleteEvent } from '@/lib/firestore'
import { eventSchema } from '@/lib/validations'
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
    const validated = eventSchema.partial().parse(body)

    await updateEvent(id, {
      ...validated,
      title: validated.title ? sanitizeHtml(validated.title) : undefined,
      location: validated.location ? sanitizeHtml(validated.location) : undefined,
      description: validated.description ? sanitizeHtml(validated.description) : undefined,
      badgeLabel: validated.badgeLabel ? sanitizeHtml(validated.badgeLabel) : undefined,
      registrationLabel: validated.registrationLabel ? sanitizeHtml(validated.registrationLabel) : undefined,
    })

    await logAdminAction({
      action: 'event.update',
      resourceType: 'event',
      resourceId: id,
      actor: admin,
      request,
      details: { fields: Object.keys(validated) },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Event updated successfully',
    }))
  } catch (err: unknown) {
    console.error('Error updating event:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update event' }, { status: 500 }))
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
    await deleteEvent(id)

    await logAdminAction({
      action: 'event.delete',
      resourceType: 'event',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting event:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete event' }, { status: 500 }))
  }
}