import { NextRequest, NextResponse } from 'next/server'
import { updateContactMessage, deleteContactMessage } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'

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

  try {
    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    if (body.isRead !== undefined) updateData.isRead = Boolean(body.isRead)

    await updateContactMessage(id, updateData)

    await logAdminAction({
      action: 'message.update',
      resourceType: 'contactMessage',
      resourceId: id,
      actor: admin,
      request,
      details: { isRead: updateData.isRead ?? null },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Message updated successfully',
    }))
  } catch (error) {
    console.error('Error updating message:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update message' }, { status: 500 }))
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
    await deleteContactMessage(id)

    await logAdminAction({
      action: 'message.delete',
      resourceType: 'contactMessage',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting message:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete message' }, { status: 500 }))
  }
}