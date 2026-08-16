import { NextRequest, NextResponse } from 'next/server'
import {
  getCertificatesByMemberUid,
  getCertificatesByMemberId,
  getCertificatesByEmail,
  getCertificateTemplateById,
  getActiveCertificateTemplateByType,
  createCertificate,
  seedDefaultCertificateTemplates,
} from '@/lib/firestore'
import { getMemberByUid } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
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

    const memberId = (member as { id?: string }).id
    const memberEmail = member.email?.toLowerCase()

    // Query by memberUid, memberId, AND email (to include webinar certificates
    // issued to the same email used at webinar registration - covers members
    // and any certificates issued to their registered address).
    const [uidCerts, idCerts, emailCerts] = await Promise.all([
      getCertificatesByMemberUid(decoded.uid),
      memberId ? getCertificatesByMemberId(memberId) : Promise.resolve([]),
      memberEmail ? getCertificatesByEmail(memberEmail) : Promise.resolve([]),
    ])

    // Merge and deduplicate by certificate id
    const certMap = new Map<string, (typeof uidCerts)[number]>()
    for (const cert of [...uidCerts, ...idCerts, ...emailCerts]) {
      if (cert.id && !certMap.has(cert.id)) {
        certMap.set(cert.id, cert)
      }
    }
    let certificates = Array.from(certMap.values())
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })

    // Lazy backfill: if the member is approved but has no certificates,
    // attempt to auto-issue one on-the-fly. This handles members who were
    // approved before the auto-issuance fix was deployed.
    if (certificates.length === 0 && member.status === 'approved') {
      try {
        await seedDefaultCertificateTemplates()
        const membershipType = member.membershipType || 'all'
        const template = await getActiveCertificateTemplateByType(membershipType)
        if (template && template.id) {
          const memberUid = (member as { uid?: string | null }).uid
          if (memberUid) {
            await createCertificate({
              templateId: template.id,
              memberId: memberId || '',
              memberUid,
              memberName: sanitizeHtml(member.fullName),
              membershipType: sanitizeHtml(membershipType),
              qualification: member.qualification ? sanitizeHtml(member.qualification) : null,
              certificateNumber: `UPISHA-${memberId || ''}`,
              issueDate: new Date().toISOString(),
              status: 'issued',
            })
            // Re-fetch certificates after backfill
            const [newUidCerts, newIdCerts] = await Promise.all([
              getCertificatesByMemberUid(decoded.uid),
              memberId ? getCertificatesByMemberId(memberId) : Promise.resolve([]),
            ])
            const newCertMap = new Map<string, (typeof newUidCerts)[number]>()
            for (const cert of [...newUidCerts, ...newIdCerts]) {
              if (cert.id && !newCertMap.has(cert.id)) {
                newCertMap.set(cert.id, cert)
              }
            }
            certificates = Array.from(newCertMap.values())
              .sort((a, b) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return bTime - aTime
              })
          }
        }
      } catch (backfillError) {
        // Log but don't fail the request if backfill fails
        console.error('Error auto-issuing certificate on backfill:', backfillError)
      }
    }

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