import { NextRequest, NextResponse } from 'next/server'
import { getReceipts, createReceipt, getReceiptByReceiptNumber } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'
import { enqueueEmail } from '@/lib/email-outbox'
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
  const admin = auth as { uid: string; email: string | null }

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

    const notify = body?.notify !== false
    if (notify) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://upisha.org'
      try {
        await enqueueEmail({
          dedupeKey: `receipt:${receiptData.receiptNumber}`,
          template: 'receipt',
          to: { email: receiptData.memberEmail, name: receiptData.memberName },
          templateData: {
            fullName: receiptData.memberName,
            receiptNumber: receiptData.receiptNumber,
            amount: receiptData.amount,
            transactionType: receiptData.transactionType,
            description: receiptData.description,
            paidAt: (receiptData.issuedAt ?? new Date()).toLocaleDateString(),
            receiptUrl: `${siteUrl}/member/receipts`,
          },
          source: { collection: 'receipts', id: result.id },
          requestedBy: { type: 'admin', uid: admin.uid, email: admin.email },
          approvedBy: { uid: admin.uid, email: admin.email },
        })
      } catch (queueError) {
        console.error('Failed to queue receipt email:', queueError)
      }
    }

    await logAdminAction({
      action: 'receipt.create',
      resourceType: 'receipt',
      resourceId: result.id,
      actor: admin,
      request,
      details: {
        receiptNumber: receiptData.receiptNumber,
        memberId: receiptData.memberId,
        amount: receiptData.amount,
        transactionType: receiptData.transactionType,
        status: receiptData.status,
      },
    })

    return withSecurityHeaders(NextResponse.json({ success: true, id: result.id }, { status: 201 }))
  } catch (error) {
    console.error('Error creating receipt:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 }))
  }
}