import { NextRequest, NextResponse } from 'next/server'
import { updateMember, deleteMember } from '@/lib/firestore'
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
    // Allow updating status and other member fields
    const updateData: Record<string, unknown> = {}
    if (body.status) updateData.status = sanitizeHtml(body.status)
    if (body.fullName) updateData.fullName = sanitizeHtml(body.fullName)
    if (body.email) updateData.email = String(body.email).toLowerCase()
    if (body.phone) updateData.phone = sanitizeHtml(body.phone)
    if (body.membershipType) updateData.membershipType = sanitizeHtml(body.membershipType)
    if (body.city) updateData.city = sanitizeHtml(body.city)
    if (body.address !== undefined) updateData.address = body.address ? sanitizeHtml(body.address) : null

    await updateMember(id, updateData)

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Member updated successfully',
    }))
  } catch (error) {
    console.error('Error updating member:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update member' }, { status: 500 }))
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
    await deleteMember(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Member deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting member:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete member' }, { status: 500 }))
  }
}