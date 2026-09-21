import { NextRequest, NextResponse } from 'next/server'
import { getReceipts, createReceipt, getReceiptByReceiptNumber } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
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

  // CSRF protection for mutating requests (parity with the certificates
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
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

    // Amount must be a usable, non-negative number — an NaN or negative value
    // would corrupt the admin "Total Paid" summary.
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Invalid amount. Must be a non-negative number.' },
        { status: 400 }
      ))
    }

    const validTypes: ReceiptTransactionType[] = ['membership', 'webinar', 'event', 'other']
    const validStatuses: ReceiptStatus[] = ['paid', 'pending', 'refunded']

    // Receipt numbers are used as deterministic doc IDs for membership
    // receipts (UPISHA-RCPT-<memberId>) and webinar receipts
    // (UPISHA-RCPT-WEB-<registrationId>). Reject duplicates so a manual POST
    // cannot create a second document for an already-issued number.
    const normalizedReceiptNumber = receiptNumber ? sanitizeHtml(String(receiptNumber)) : null
    if (normalizedReceiptNumber) {
      const existing = await getReceiptByReceiptNumber(normalizedReceiptNumber)
      if (existing) {
        return withSecurityHeaders(NextResponse.json(
          { error: `A receipt with number "${normalizedReceiptNumber}" already exists.` },
          { status: 409 }
        ))
      }
    }

    const receiptData: ReceiptDoc = {
      receiptNumber: normalizedReceiptNumber || `UPISHA-RCPT-${Date.now()}`,
      memberId: sanitizeHtml(String(memberId)),
      memberUid: sanitizeHtml(String(memberUid)),
      memberName: sanitizeHtml(String(memberName)),
      memberEmail: String(memberEmail).toLowerCase(),
      transactionType: validTypes.includes(transactionType) ? transactionType : 'other',
      description: sanitizeHtml(String(description)),
      amount: parsedAmount,
      currency: 'INR',
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