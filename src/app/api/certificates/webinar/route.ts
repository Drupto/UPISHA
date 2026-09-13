import { NextRequest, NextResponse } from 'next/server'
import {
  getWebinarRegistrations,
  getWebinarById,
  getCertificateTemplateById,
  upsertCertificate,
  getCertificatesByEmail,
  seedDefaultCertificateTemplates,
} from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import type { WebinarRegistrationDoc } from '@/lib/types'

/**
 * Admin-only endpoint to issue a webinar participation certificate.
 * The admin selects a confirmed registration and a webinar certificate template.
 * Certificates are issued manually AFTER the webinar has taken place, so
 * participants only receive them once they have actually attended.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const { registrationId, templateId } = body

    if (!registrationId || !templateId) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Missing required fields: registrationId and templateId' },
        { status: 400 }
      ))
    }

    if (!rateLimit(`certificate:webinar:create`, 20, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      ))
    }

    // Ensure default templates (including webinar) are seeded
    await seedDefaultCertificateTemplates()

    // Find the registration
    const registrations = await getWebinarRegistrations()
    const registration = registrations.find((r) => r.id === registrationId) as (WebinarRegistrationDoc & { id: string }) | undefined
    if (!registration) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Webinar registration not found' },
        { status: 404 }
      ))
    }

    // Only confirmed registrations can receive a certificate
    if (registration.status !== 'confirmed') {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Only confirmed registrations can receive a certificate' },
        { status: 400 }
      ))
    }

    // Validate the template is a webinar template
    const template = await getCertificateTemplateById(templateId)
    if (!template) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Certificate template not found' },
        { status: 404 }
      ))
    }
    if ((template.category || 'membership') !== 'webinar') {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Please select a webinar certificate template' },
        { status: 400 }
      ))
    }

    // Prevent duplicate issuance for the same registration
    const existingCerts = await getCertificatesByEmail(registration.email)
    const alreadyIssued = existingCerts.some(
      (c) => c.webinarId === registration.webinarId && c.status !== 'revoked'
    )
    if (alreadyIssued) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'A certificate has already been issued for this registration' },
        { status: 409 }
      ))
    }

    // Fetch webinar details for the certificate
    const webinar = registration.webinarId ? await getWebinarById(registration.webinarId) : null

    const certificate = await upsertCertificate({
      templateId,
      type: 'webinar',
      memberName: sanitizeHtml(registration.fullName),
      email: registration.email.toLowerCase(),
      webinarId: registration.webinarId,
      webinarTitle: sanitizeHtml(registration.webinarTitle),
      webinarDate: webinar?.date || null,
      webinarSpeaker: webinar?.speaker ? sanitizeHtml(webinar.speaker) : null,
      webinarDuration: webinar?.duration ? sanitizeHtml(webinar.duration) : null,
      qualification: registration.qualification ? sanitizeHtml(registration.qualification) : null,
      registrationNumber: registration.registrationNumber || null,
      certificateNumber: `UPISHA-WEB-${registrationId}`,
      issueDate: new Date().toISOString(),
      status: 'issued',
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: certificate.id,
      message: 'Webinar certificate issued successfully',
    }, { status: 201 }))
  } catch (error) {
    console.error('Error creating webinar certificate:', error)
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to issue webinar certificate' },
      { status: 500 }
    ))
  }
}