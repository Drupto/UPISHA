import { NextRequest, NextResponse } from 'next/server'
import { getCertificateById } from '@/lib/firestore'
import { withSecurityHeaders, rateLimit } from '@/lib/security'

/**
 * Public certificate verification endpoint.
 * No authentication required — anyone scanning the QR code on a certificate
 * can verify its authenticity here.
 *
 * Returns only safe public data (no member contact/private information).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Rate limit public verification lookups to prevent abuse/scraping
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`certificate:verify:${ip}`, 30, 60 * 1000)) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    ))
  }

  try {
    const certificate = await getCertificateById(id)

    if (!certificate) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      ))
    }

    // Only expose safe public verification data — never memberId, memberUid,
    // email, phone, qualification, or any other private information.
    return withSecurityHeaders(NextResponse.json({
      id: certificate.id,
      type: certificate.type || 'membership',
      memberName: certificate.memberName,
      certificateNumber: certificate.certificateNumber,
      membershipType: certificate.membershipType,
      issueDate: certificate.issueDate,
      status: certificate.status || 'issued',
      ...(certificate.type === 'webinar' ? {
        webinarTitle: certificate.webinarTitle,
        webinarDate: certificate.webinarDate,
        webinarSpeaker: certificate.webinarSpeaker,
        webinarDuration: certificate.webinarDuration,
      } : {}),
    }))
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    ))
  }
}