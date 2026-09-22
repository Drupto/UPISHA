import { NextRequest, NextResponse } from 'next/server'
import { updateAnnouncement, deleteAnnouncement } from '@/lib/firestore'
import { announcementSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
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

  try {
    const body = await request.json()
    const validated = announcementSchema.partial().parse(body)

    await updateAnnouncement(id, {
      ...validated,
      title: validated.title ? sanitizeHtml(validated.title) : undefined,
      type: validated.type ? sanitizeHtml(validated.type) : undefined,
      content: validated.content ? sanitizeHtml(validated.content) : undefined,
    })

    await logAdminAction({
      action: 'announcement.update',
      resourceType: 'announcement',
      resourceId: id,
      actor: admin,
      request,
      details: { fields: Object.keys(validated) },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
    }))
  } catch (err: unknown) {
    console.error('Error updating announcement:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 }))
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

  try {
    await deleteAnnouncement(id)

    await logAdminAction({
      action: 'announcement.delete',
      resourceType: 'announcement',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 }))
  }
}