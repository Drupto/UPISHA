import { NextRequest, NextResponse } from 'next/server'
import { updateEvent, deleteEvent } from '@/lib/firestore'
import { eventSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function PUT(
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
    const validated = eventSchema.partial().parse(body)

    await updateEvent(id, {
      ...validated,
      title: validated.title ? sanitizeHtml(validated.title) : undefined,
      location: validated.location ? sanitizeHtml(validated.location) : undefined,
      description: validated.description ? sanitizeHtml(validated.description) : undefined,
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

  try {
    await deleteEvent(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting event:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete event' }, { status: 500 }))
  }
}