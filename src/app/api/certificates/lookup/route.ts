import { NextRequest, NextResponse } from 'next/server'
import { getCertificatesByEmail, getCertificateTemplateById } from '@/lib/firestore'
import { withSecurityHeaders, rateLimit } from '@/lib/security'

/**
 * Public endpoint to look up webinar participation certificates by email.
 * Used by the "Find My Certificate" page for non-members who registered
 * for a webinar but have no member account.
 *
 * Only returns webinar certificates (never membership certificates) and
 * only safe public data (no private contact info beyond the email used).
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'A valid email address is required' },
      { status: 400 }
    ))
  }

  // Rate limit public lookups to prevent abuse/scraping
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`certificate:lookup:${ip}`, 20, 60 * 1000)) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    ))
  }

  try {
    const certificates = await getCertificatesByEmail(email)

    // Only expose webinar certificates publicly via email lookup
    const webinarCerts = certificates.filter((c) => c.type === 'webinar' && c.status !== 'revoked')

    // Attach template data for rendering
    const enriched: Array<Record<string, unknown>> = []
    for (const cert of webinarCerts) {
      const template = cert.templateId ? await getCertificateTemplateById(cert.templateId) : null
      enriched.push({
        id: cert.id,
        memberName: cert.memberName,
        certificateNumber: cert.certificateNumber,
        issueDate: cert.issueDate,
        webinarTitle: cert.webinarTitle,
        webinarDate: cert.webinarDate,
        webinarSpeaker: cert.webinarSpeaker,
        webinarDuration: cert.webinarDuration,
        status: cert.status || 'issued',
        template: template ? {
          id: template.id,
          name: template.name,
          accountType: template.accountType,
          category: template.category,
          title: template.title,
          subtitle: template.subtitle,
          titleFont: template.titleFont,
          subtitleFont: template.subtitleFont,
          textBlocks: template.textBlocks,
          footerText: template.footerText,
          logoUrl: template.logoUrl,
          signatureUrl: template.signatureUrl,
          stampUrl: template.stampUrl,
          backgroundUrl: template.backgroundUrl,
          borderColor: template.borderColor,
          accentColor: template.accentColor,
          fontFamily: template.fontFamily,
        } : null,
      })
    }

    return withSecurityHeaders(NextResponse.json({ certificates: enriched }))
  } catch (error) {
    console.error('Error looking up certificates:', error)
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to look up certificates' },
      { status: 500 }
    ))
  }
}