import { NextRequest, NextResponse } from 'next/server'
import { deleteWebinarRegistration } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

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