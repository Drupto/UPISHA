import { NextRequest, NextResponse } from 'next/server'
import { updateContactMessage, deleteContactMessage } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

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
    const updateData: Record<string, unknown> = {}
    if (body.isRead !== undefined) updateData.isRead = Boolean(body.isRead)

    await updateContactMessage(id, updateData)

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

  try {
    await deleteContactMessage(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting message:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete message' }, { status: 500 }))
  }
}