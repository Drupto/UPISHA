import { NextRequest, NextResponse } from 'next/server'
import { getReceiptById, updateReceipt, deleteReceipt } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import type { ReceiptStatus } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const receipt = await getReceiptById(id)
    if (!receipt) {
      return withSecurityHeaders(NextResponse.json({ error: 'Receipt not found' }, { status: 404 }))
    }
    return withSecurityHeaders(NextResponse.json({ receipt }))
  } catch (error) {
    console.error('Error fetching receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 }))
  }
}

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

    if (body.status) {
      const validStatuses: ReceiptStatus[] = ['paid', 'pending', 'refunded']
      if (!validStatuses.includes(body.status)) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Invalid status. Must be paid, pending, or refunded.' },
          { status: 400 }
        ))
      }
      updateData.status = body.status
    }
    if (body.description) updateData.description = sanitizeHtml(body.description)
    if (body.amount !== undefined) updateData.amount = Number(body.amount)
    if (body.transactionNumber !== undefined) {
      updateData.transactionNumber = body.transactionNumber ? sanitizeHtml(String(body.transactionNumber)) : null
    }
    if (body.paymentMethod !== undefined) {
      updateData.paymentMethod = body.paymentMethod ? sanitizeHtml(String(body.paymentMethod)) : null
    }

    await updateReceipt(id, updateData)
    return withSecurityHeaders(NextResponse.json({ success: true, message: 'Receipt updated successfully' }))
  } catch (error) {
    console.error('Error updating receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 }))
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
    await deleteReceipt(id)
    return withSecurityHeaders(NextResponse.json({ success: true, message: 'Receipt deleted successfully' }))
  } catch (error) {
    console.error('Error deleting receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 }))
  }
}