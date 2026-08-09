import { NextRequest, NextResponse } from 'next/server'
import {
  getCertificates,
  createCertificate,
  getCertificateTemplateById,
  getCertificatesByMemberId,
  seedDefaultCertificateTemplates,
} from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { getMemberById } from './helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    // Ensure default templates are seeded
    await seedDefaultCertificateTemplates()

    const certificates = await getCertificates()
    return withSecurityHeaders(NextResponse.json({ certificates }))
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const { memberId, templateId } = body

    if (!memberId || !templateId) {
      return withSecurityHeaders(NextResponse.json({ error: 'Missing required fields: memberId and templateId' }, { status: 400 }))
    }

    if (!rateLimit(`certificate:create`, 20, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const member = await getMemberById(memberId)
    if (!member) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member not found' }, { status: 404 }))
    }

    const template = await getCertificateTemplateById(templateId)
    if (!template) {
      return withSecurityHeaders(NextResponse.json({ error: 'Certificate template not found' }, { status: 404 }))
    }

    // Check if a certificate already exists for this member + template combination
    const existingCerts = await getCertificatesByMemberId(memberId)
    const alreadyIssued = existingCerts.some((c) => c.templateId === templateId && c.status !== 'revoked')
    if (alreadyIssued) {
      return withSecurityHeaders(NextResponse.json({ error: 'A certificate with this template has already been issued to this member' }, { status: 409 }))
    }

    const memberUid = (member as { uid?: string | null }).uid
    if (!memberUid) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member has no associated user account' }, { status: 400 }))
    }

    const certificate = await createCertificate({
      templateId,
      memberId,
      memberUid,
      memberName: sanitizeHtml(member.fullName),
      membershipType: sanitizeHtml(member.membershipType),
      qualification: member.qualification ? sanitizeHtml(member.qualification) : null,
      certificateNumber: `UPISHA-${memberId}`,
      issueDate: new Date().toISOString(),
      status: 'issued',
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: certificate.id,
      message: 'Certificate issued successfully',
    }, { status: 201 }))
  } catch (error) {
    console.error('Error creating certificate:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 }))
  }
}
