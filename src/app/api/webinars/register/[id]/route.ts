import { NextRequest, NextResponse } from 'next/server'
import { deleteWebinarRegistration, updateWebinarRegistration } from '@/lib/firestore'
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
    const { status } = body

    if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Invalid status. Must be pending, confirmed, or rejected.' },
        { status: 400 }
      ))
    }

    await updateWebinarRegistration(id, { status })
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: `Registration marked as ${status}`,
    }))
  } catch (error) {
    console.error('Error updating webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update registration' }, { status: 500 }))
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
    await deleteWebinarRegistration(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 }))
  }
}