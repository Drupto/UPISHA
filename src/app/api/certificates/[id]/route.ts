import { NextRequest, NextResponse } from 'next/server'
import { updateCertificate, deleteCertificate } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
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
    const updateData: Record<string, unknown> = {}
    if (body.status) updateData.status = body.status

    await updateCertificate(id, updateData)

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Certificate updated successfully',
    }))
  } catch (error) {
    console.error('Error updating certificate:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 }))
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
    await deleteCertificate(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 }))
  }
}