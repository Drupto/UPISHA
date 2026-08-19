import { NextRequest, NextResponse } from 'next/server'
import { getWebinarRegistrationByRegistrationNumber, getCertificatesByRegistrationId, getReceiptByRegistrationNumber } from '@/lib/firestore'
import { withSecurityHeaders, rateLimit } from '@/lib/security'

/**
 * Mask a transaction reference so only the owner (who knows the full value)
 * can recognize it, while still exposing enough digits for the registrant to
 * confirm it is their own payment. No raw PII is returned to the public endpoint.
 */
function maskTransactionNumber(value?: string | null): string | null {
  if (!value) return null
  const v = String(value).trim()
  if (v.length <= 6) return '••••••'
  const first = v.slice(0, 2)
  const last = v.slice(-4)
  const masked = '•'.repeat(Math.max(v.length - 6, 4))
  return `${first}${masked}${last}`
}

export async function GET(request: NextRequest) {
  const regNumber = request.nextUrl.searchParams.get('regNumber') || ''

  if (!regNumber) {
    return withSecurityHeaders(NextResponse.json({ error: 'Registration number is required' }, { status: 400 }))
  }

  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  if (!rateLimit(`webinar-lookup:${ip}`, 20, 60 * 1000)) {
    return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
  }

  try {
    const registration = await getWebinarRegistrationByRegistrationNumber(regNumber)
    if (!registration) {
      return withSecurityHeaders(NextResponse.json({ error: 'Registration not found' }, { status: 404 }))
    }

    const certificates = await getCertificatesByRegistrationId(regNumber)
    const receiptDoc = await getReceiptByRegistrationNumber(regNumber)

    // Build a PII-safe receipt block. Never include email, phone, memberId,
    // memberUid, qualification, or the full transaction number. Only expose
    // transaction-safe fields plus a masked transaction reference.
    const receipt = receiptDoc
      ? {
          receiptNumber: receiptDoc.receiptNumber,
          amount: receiptDoc.amount,
          currency: receiptDoc.currency,
          description: receiptDoc.description,
          paymentMethod: receiptDoc.paymentMethod,
          transactionNumber: maskTransactionNumber(receiptDoc.transactionNumber),
          status: receiptDoc.status,
          issuedAt: receiptDoc.issuedAt,
        }
      : null

    // Only expose safe public data — never email, phone, or any other
    // private contact information.
    return withSecurityHeaders(NextResponse.json({
      registration: {
        id: registration.id,
        fullName: registration.fullName,
        webinarTitle: registration.webinarTitle,
        webinarType: registration.webinarType,
        status: registration.status,
        registrationNumber: registration.registrationNumber,
        createdAt: registration.createdAt,
      },
      certificates: certificates.map((c) => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        issueDate: c.issueDate,
        status: c.status,
      })),
      receipt,
    }))
  } catch (error) {
    console.error('Error looking up webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to look up registration' }, { status: 500 }))
  }
}