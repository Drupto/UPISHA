import { NextRequest, NextResponse } from 'next/server'
import { getCertificatesByMemberUid, getCertificateTemplateById } from '@/lib/firestore'
import { getMemberByUid } from '@/lib/firestore'
import { withSecurityHeaders } from '@/lib/security'
import { requireVerifiedMember } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireVerifiedMember(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const decoded = auth as { uid: string }
    const member = await getMemberByUid(decoded.uid)

    if (!member) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member profile not found' }, { status: 404 }))
    }

    const certificates = await getCertificatesByMemberUid(decoded.uid)
    const memberId = (member as { id?: string }).id

    // Attach template data to each certificate for rendering
    const enriched: Array<Record<string, unknown>> = []
    for (const cert of certificates) {
      const template = cert.templateId ? await getCertificateTemplateById(cert.templateId) : null
      enriched.push({
        ...cert,
        memberId,
        template: template ? {
          id: template.id,
          name: template.name,
          accountType: template.accountType,
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
    console.error('Error fetching member certificates:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 }))
  }
}