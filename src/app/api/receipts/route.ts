import { NextRequest, NextResponse } from 'next/server'
import { getReceipts, createReceipt } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import type { ReceiptDoc, ReceiptTransactionType, ReceiptStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const receipts = await getReceipts()
    return withSecurityHeaders(NextResponse.json({ receipts }))
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()

    const {
      receiptNumber,
      memberId,
      memberUid,
      memberName,
      memberEmail,
      transactionType,
      description,
      amount,
      currency,
      transactionNumber,
      paymentMethod,
      status,
      issuedAt,
    } = body

    if (!memberId || !memberUid || !memberName || !memberEmail || !description || !amount) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Missing required fields: memberId, memberUid, memberName, memberEmail, description, amount' },
        { status: 400 }
      ))
    }

    const validTypes: ReceiptTransactionType[] = ['membership', 'webinar', 'event', 'other']
    const validStatuses: ReceiptStatus[] = ['paid', 'pending', 'refunded']

    const receiptData: ReceiptDoc = {
      receiptNumber: receiptNumber ? sanitizeHtml(String(receiptNumber)) : `UPISHA-RCPT-${Date.now()}`,
      memberId: sanitizeHtml(String(memberId)),
      memberUid: sanitizeHtml(String(memberUid)),
      memberName: sanitizeHtml(String(memberName)),
      memberEmail: String(memberEmail).toLowerCase(),
      transactionType: validTypes.includes(transactionType) ? transactionType : 'other',
      description: sanitizeHtml(String(description)),
      amount: Number(amount),
      currency: currency === 'INR' ? 'INR' : 'INR',
      transactionNumber: transactionNumber ? sanitizeHtml(String(transactionNumber)) : null,
      paymentMethod: paymentMethod ? sanitizeHtml(String(paymentMethod)) : null,
      status: validStatuses.includes(status) ? status : 'paid',
      issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
    }

    const result = await createReceipt(receiptData)
    return withSecurityHeaders(NextResponse.json({ success: true, id: result.id }, { status: 201 }))
  } catch (error) {
    console.error('Error creating receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 }))
  }
}