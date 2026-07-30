import { NextRequest, NextResponse } from 'next/server'
import { updateWebinar, deleteWebinar } from '@/lib/firestore'
import { webinarSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const body = await request.json()
    const validated = webinarSchema.partial().parse(body)

    await updateWebinar(id, {
      ...validated,
      title: validated.title ? sanitizeHtml(validated.title) : undefined,
      speaker: validated.speaker ? sanitizeHtml(validated.speaker) : undefined,
      description: validated.description ? sanitizeHtml(validated.description) : undefined,
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
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    await deleteWebinar(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Webinar deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting webinar:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete webinar' }, { status: 500 }))
  }
}