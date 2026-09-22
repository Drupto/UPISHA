import { NextRequest, NextResponse } from 'next/server'
import {
  getWebinarRegistrations,
  getWebinarById,
  getCertificateTemplateById,
  upsertCertificate,
  getCertificatesByEmail,
  seedDefaultCertificateTemplates,
} from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'
import { logAdminAction } from '@/lib/audit-log'
import { enforceBodySizeLimit } from '@/lib/validations'
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
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with templates endpoints)
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  // Reject oversized request bodies
  if (!enforceBodySizeLimit(request.headers)) {
    return withSecurityHeaders(NextResponse.json({ error: 'Request body too large' }, { status: 413 }))
  }

  const ip = getClientIp(request.headers)

  try {
    const body = await request.json()
    const { registrationId, templateId } = body

    if (!registrationId || !templateId) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Please select both a confirmed registration and a certificate template before issuing.' },
        { status: 400 }
      ))
    }

    // Distributed per-admin rate limit (replaces the in-memory global limiter
    // whose 20/hour budget was shared across ALL admins and reset on every
    // serverless instance cold-start).
    const rate = await checkRateLimitStrict(`certificate:webinar:create:${ip}:${admin.uid}`, 20, 60 * 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Issuance limit reached (20 certificates per hour). Please wait a while before issuing more certificates.' },
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
        { error: 'This registration could not be found. It may have been deleted — refresh the page and try again.' },
        { status: 404 }
      ))
    }

    // Only confirmed registrations can receive a certificate
    if (registration.status !== 'confirmed') {
      return withSecurityHeaders(NextResponse.json(
        { error: 'This registration has not been confirmed yet. Confirm it from the registrations list first, then issue the certificate.' },
        { status: 400 }
      ))
    }

    // Validate the template is a webinar template
    const template = await getCertificateTemplateById(templateId)
    if (!template) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'The selected certificate template no longer exists. It may have been deleted — refresh the page and pick a different template.' },
        { status: 404 }
      ))
    }
    if ((template.category || 'membership') !== 'webinar') {
      return withSecurityHeaders(NextResponse.json(
        { error: 'The selected template is not a webinar template. Webinar certificates can only use templates in the "Webinar" category — pick a different template.' },
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
        { error: 'This attendee already has a certificate for this webinar — each attendee can receive only one certificate per webinar. You can view it in the certificates list.' },
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
      registrationId,
      registrationNumber: registration.registrationNumber || null,
      certificateNumber: `UPISHA-WEB-${registrationId}`,
      issueDate: new Date().toISOString(),
      status: 'issued',
    })

    // Audit log the issuance
    await logAdminAction({
      action: 'certificate.issue',
      resourceType: 'certificate',
      resourceId: certificate.id,
      actor: admin,
      ip,
      userAgent: request.headers.get('user-agent'),
      details: {
        type: 'webinar',
        registrationId,
        email: registration.email,
        webinarTitle: registration.webinarTitle,
        certificateNumber: `UPISHA-WEB-${registrationId}`,
      },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: certificate.id,
      message: 'Webinar certificate issued successfully. The attendee will receive an email with a link to view and download it.',
    }, { status: 201 }))
  } catch (error) {
    console.error('Error creating webinar certificate:', error)
    return withSecurityHeaders(NextResponse.json(
      { error: 'Something went wrong while issuing the certificate. Please try again — if it keeps failing, refresh the page or sign in again.' },
      { status: 500 }
    ))
  }
}