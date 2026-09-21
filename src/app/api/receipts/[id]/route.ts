import { NextRequest, NextResponse } from 'next/server'
import { getReceiptById, updateReceipt, deleteReceipt } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { getClientIp } from '@/lib/firestore-rate-limit'
import { logApiRequest } from '@/lib/request-logger'
import { requireAdmin } from '@/lib/auth-helpers'
import type { ReceiptStatus } from '@/lib/types'

/** Firestore updateDoc/deleteDoc reject missing docs — surface it as a clean 404. */
function isNotFound(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === 'not-found'
}

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
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  const ip = getClientIp(request.headers)

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
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount < 0) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Invalid amount. Must be a non-negative number.' },
          { status: 400 }
        ))
      }
      updateData.amount = amount
    }
    if (body.transactionNumber !== undefined) {
      updateData.transactionNumber = body.transactionNumber ? sanitizeHtml(String(body.transactionNumber)) : null
    }
    if (body.paymentMethod !== undefined) {
      updateData.paymentMethod = body.paymentMethod ? sanitizeHtml(String(body.paymentMethod)) : null
    }

    // Nothing recognisable to change — fail loudly instead of answering
    // "updated successfully" for a silent no-op.
    if (Object.keys(updateData).length === 0) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'No supported fields to update.' },
        { status: 400 }
      ))
    }

    await updateReceipt(id, updateData)

    // Audit log the change
    await logApiRequest({
      endpoint: `/api/receipts/${id}`,
      method: 'PATCH',
      ip,
      userId: admin.uid,
      userAgent: request.headers.get('user-agent'),
      status: 200,
      timestamp: new Date(),
    })

    return withSecurityHeaders(NextResponse.json({ success: true, message: 'Receipt updated successfully' }))
  } catch (error) {
    if (isNotFound(error)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Receipt not found' }, { status: 404 }))
    }
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
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  const ip = getClientIp(request.headers)

  try {
    await deleteReceipt(id)

    // Audit log the deletion (financial record — keep a trail of who removed it)
    await logApiRequest({
      endpoint: `/api/receipts/${id}`,
      method: 'DELETE',
      ip,
      userId: admin.uid,
      userAgent: request.headers.get('user-agent'),
      status: 200,
      timestamp: new Date(),
    })

    return withSecurityHeaders(NextResponse.json({ success: true, message: 'Receipt deleted successfully' }))
  } catch (error) {
    if (isNotFound(error)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Receipt not found' }, { status: 404 }))
    }
    console.error('Error deleting receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 }))
  }
}