import { NextRequest, NextResponse } from 'next/server'
import { getWebinarRegistrationByRegistrationNumber, getCertificatesByRegistrationId } from '@/lib/firestore'
import { withSecurityHeaders, rateLimit } from '@/lib/security'

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
    }))
  } catch (error) {
    console.error('Error looking up webinar registration:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to look up registration' }, { status: 500 }))
  }
}