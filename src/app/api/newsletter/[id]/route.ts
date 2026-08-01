import { NextRequest, NextResponse } from 'next/server'
import { deleteNewsletterSubscriber } from '@/lib/firestore'
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
    await deleteNewsletterSubscriber(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 }))
  }
}